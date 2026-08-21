# How LocalStack Saved the State Machine (Step Functions)

## Talk Context

This talk is the story of a project that sounded simple at first: bring customer call recordings from an IVR platform into Capital One and make them available for playback in Sage.

The business goal can be summarized in one sentence:

> **Capture customer IVR call recordings, bring them into Capital One, and make them accessible through Sage.**

At the highest level, the flow looked almost trivial:

```text
Customer Call → Recording → Capital One → Sage
```

The complexity appeared when we started adding the real constraints.

---

## 1. The Deceptively Simple Problem

The IVR platform handles customer calls and generates an audio recording after each call ends. We needed to reliably ingest those recordings into Capital One.

At first glance, this sounds like a file-transfer problem:

```text
Get a recording → Move it from A to B → Store it → Play it
```

But the real question quickly became:

> **How do we make sure we receive every recording we are supposed to receive?**

Moving a file was easy. Knowing that we moved **every file** was the hard part.

---

## 2. The Constraints

### 2.1 Scale: More Than One Million Calls Per Day

The IVR platform processes, on average, more than **1 million calls every day**.

A typical call recording is approximately **5–6 MB**, with calls commonly lasting a few minutes, although individual calls can be considerably longer.

At one million recordings per day, that means roughly:

> **5–6 TB of audio every day.**

The solution could not be a small utility or an occasional batch process. Both the primary ingestion mechanism and the recovery mechanism had to operate at production scale.

### 2.2 Multi-Tenancy

The platform also needed to support multiple Lines of Business (LOBs), sub-LOBs, application groups, and call flows.

Conceptually:

```text
1M+ calls/day
    × multiple LOBs
    × multiple sub-LOBs
    × multiple application/call-flow groups
```

The ingestion and reconciliation mechanisms therefore needed to understand which workload a recording belonged to and process different groups independently.

### 2.3 Some Recordings Cannot Be Lost

Certain customer interactions, including payment-related calls, have important regulatory and compliance requirements.

For those workloads:

> **“We transferred most of the recordings” is not a valid success criterion.**

The platform needed to know:

- which calls occurred;
- which recordings were expected;
- which recordings arrived;
- which recordings were still missing;
- which missing recordings were already being recovered;
- and whether recovery eventually succeeded.

This changed the problem from simple file ingestion into a **completeness and reconciliation problem**.

### 2.4 Scalability and Resilience

The system needed to be scalable and resilient enough to continuously process the production workload.

But resilience alone was not enough.

The more important requirement was:

> **The system needs to know when something is missing.**

That leads naturally to a lifecycle such as:

```text
Track → Detect → Retry → Reconcile → Recover
```

### 2.5 Vendor Constraints

We evaluated three vendors. The selected vendor also provides the IVR platform.

The reasons for the vendor selection are outside the scope of this talk, but the important architectural constraint was that the selected vendor did **not** support Capital One's preferred/promoted file-transfer mechanisms for this use case.

The architecture therefore had to adapt to the mechanisms the vendor actually exposed.

### 2.6 These Are Binary Audio Files

We were not moving normal structured records or events. We were moving binary audio objects, accompanied by metadata.

Several existing transfer patterns and data pipelines were designed around structured data and were either unavailable or not directly applicable to the recording workload.

The question became:

> **How do we reliably discover, retrieve, track, and reconcile millions of binary recordings?**

---

## 3. What the Vendor Actually Gives Us

The vendor provides two mechanisms for retrieving recordings.

They initially looked like two alternatives, but eventually became two complementary parts of the architecture.

---

## 4. Method 1: Vendor Push / Streaming Upload

After a call ends, the IVR platform generates the recording.

Once the recording is ready, logic running on the vendor side streams/uploads the file to an API implemented by Capital One according to a vendor-defined contract.

The happy path is simple:

```text
Call Ends
   ↓
Recording Created
   ↓
Vendor Push
   ↓
Capital One API
   ↓
S3
```

Conceptually:

> **Receive the recording and store it.**

This was the preferred ingestion path because it avoided export orchestration, discovery, polling, pagination, and large batch retrieval.

If everything worked, this was exactly what we wanted.

But it created the most important question in the system:

> **What if the recording never arrives?**

At this scale, even a very small failure percentage can represent a significant number of missing recordings.

The push mechanism therefore could not be our only reliability strategy.

---

## 5. Method 2: Export

The second vendor mechanism is a bulk export API.

This eventually became our **reconciliation/recovery path**.

An export is not simply a download request. It is a multi-step asynchronous workflow.

### 5.1 Create the Export

An export request identifies at least:

- the application/call-flow group;
- a start timestamp;
- an end timestamp.

Conceptually:

```text
Application Group + From Timestamp + To Timestamp
                         ↓
                    Create Export
                         ↓
                       Job ID
```

The API creates an export job and returns a Job ID.

### 5.2 Poll the Export Job

Creating the export does not mean the files are immediately available.

We need to query the export status using the Job ID.

The export can be:

```text
Processing
Complete
Failed
```

The completion time is unpredictable. An export might take approximately 30 seconds, 10 minutes, or considerably longer depending on the workload.

That creates a loop:

```text
Check Status
    ↓
Still Processing? ── Yes ──→ Wait ──→ Check Again
    │
    No
    ↓
Complete / Failed
```

If it fails, the system may need to create another export.

This was the first obvious orchestration challenge:

> **Creating the export was easy. Waiting for it correctly was harder.**

We did not want a thread or Lambda sitting idle while an external process ran for an unpredictable amount of time.

### 5.3 Retrieve Export Metadata

Even when the export job successfully completes, we still do not have the recordings.

The next API call retrieves the export metadata.

The metadata describes information such as:

- number of recordings/files;
- pagination information;
- number of pages;
- information needed to retrieve the exported files.

Conceptually:

```text
Export Complete
      ↓
Get Metadata
      ↓
Files + Pages + Download Information
```

The metadata effectively becomes the execution plan for the download stage.

### 5.4 Download the Files

Using the export Job ID and pagination information from the metadata, the platform can finally retrieve the recordings.

Pages/download units can be processed in parallel where appropriate:

```text
                  Export Metadata
                       │
           ┌───────────┼───────────┐
           ▼           ▼           ▼
        Page 1       Page 2       Page N
           │           │           │
        Files        Files        Files
           │           │           │
           └──────→ Capital One ←──┘
```

This introduces additional concerns:

- concurrency;
- throughput;
- retries;
- partial failures;
- idempotency;
- pagination;
- tracking.

A failure on one page should not necessarily require reprocessing everything that already succeeded.

---

## 6. Export Is Reconciliation, Not the Primary Path

The push mechanism is the preferred path.

Export exists to close the reliability gap when recordings do not arrive through the primary mechanism.

So the two mechanisms became:

```text
                         ┌── Push ──────→ Capital One
Call → Recording ────────┤
                         │
                         └── Export ────→ Recovery / Reconciliation
```

A useful way to describe the architecture is:

> **Push gives us speed.**  
> **Tracking gives us visibility.**  
> **Reconciliation gives us completeness.**

The recovery path also needs to scale like the primary path. With more than one million calls per day, reconciliation cannot be a manual process or a small backup script.

---

## 7. Why Reconciliation Was Especially Important

The same general vendor patterns had already been used for structured IVR information such as transcripts and call events.

During incidents with the corresponding push mechanisms, teams sometimes had to perform export/recovery operations manually.

For recordings, we wanted reconciliation to be part of the platform rather than depending on humans responding to an incident.

That meant the system needed to automatically determine:

```text
What should exist?
What arrived?
What is missing?
What is already being recovered?
What still needs recovery?
```

---

## 8. The Recording Tracker

Before we could reconcile missing recordings, we needed a reliable representation of what we expected to receive.

That led to the first major platform component:

> **The Recording Tracker**

The tracker represents the lifecycle of every expected recording.

Importantly, tracking cannot begin when the audio file arrives. If we only tracked received files, we could never identify a file that never arrived.

The lifecycle begins when we know that the customer call occurred.

```text
Customer Call
     │
     ▼
Recording Expected
     │
     ├──────────── Vendor Push ────────────┐
     │                                     │
     │                                     ▼
     │                               Recording Received
     │                                     │
     │                                     ▼
     │                                  COMPLETE
     │
     ▼
Wait / Expected Delivery Window
     │
     ▼
Recording Missing
     │
     ▼
Needs Reconciliation
     │
     ▼
Assigned to Export
     │
     ▼
Export → Download → Received
     │
     ▼
COMPLETE
```

The key insight is:

> **You can't detect a missing recording if you only track the recordings you received.**

---

## 9. Detecting Missing Recordings

When a customer call occurs, the tracker records that a recording is expected.

If the recording arrives through the vendor push mechanism, the tracker is updated accordingly.

Conceptually:

```text
CALL OCCURRED
     ↓
EXPECTED
     ↓
RECEIVED VIA PUSH
     ↓
COMPLETE
```

But if enough time passes and the recording has not arrived:

```text
EXPECTED
    ↓
Delivery Window Exceeded
    ↓
MISSING
    ↓
NEEDS RECONCILIATION
```

This automatically turns missing recordings into reconciliation candidates.

---

## 10. Building Smart Export Windows

We cannot simply request a 24-hour export containing every call.

Very large time windows can cause exports to take hours to generate and potentially additional hours to download and process.

Therefore, the reconciliation system needs to intelligently group missing recordings.

At minimum, candidates need to be organized around dimensions such as:

```text
Application / Call-Flow Group
            +
       Time Window
```

The objective is to create export windows that are large enough to be efficient but small enough to remain operationally manageable.

So reconciliation includes a planning problem:

```text
Missing Recordings
       ↓
Group by Application / Call Flow
       ↓
Group by Time
       ↓
Build Optimal Export Windows
       ↓
Create Export Jobs
```

---

## 11. Preventing Duplicate Reconciliation

Multiple reconciliation workers/executions may be running concurrently.

Once recordings are selected for an export, they need to be marked as already participating in a reconciliation process.

Otherwise two executions could independently select the same missing recording:

```text
Recording A
    │
    ├── Export Job 123
    │
    └── Export Job 456
```

The tracker therefore needs lifecycle transitions conceptually similar to:

```text
MISSING
   ↓
CLAIMED FOR RECONCILIATION
   ↓
EXPORT ASSIGNED
   ↓
RECOVERED
```

This introduces concerns such as:

- idempotency;
- atomic claiming/locking;
- state transitions;
- duplicate prevention;
- retry behavior.

---

## 12. The Full Reconciliation Pipeline

Once the pieces are combined, reconciliation looks more like this:

```text
Recording Tracker
       │
       ▼
Find Missing Recordings
       │
       ▼
Group by Application / Call Flow
       │
       ▼
Build Optimal Time Windows
       │
       ▼
Claim Recordings
       │
       ▼
Create Export Job
       │
       ▼
Wait / Poll Status
       │
       ├── Failed → Retry / Re-create
       │
       ▼
Get Export Metadata
       │
       ▼
Determine Pages / Files
       │
       ▼
Fan Out Downloads
       │
       ▼
Store Recordings
       │
       ▼
Update Recording Tracker
       │
       ▼
Reconciled / Complete
```

The export does not truly finish when a file is downloaded.

It finishes when the tracker can say:

> **This expected recording is now accounted for.**

---

## 13. This Is No Longer a File-Transfer Problem

What started as:

> **Download the missing recordings.**

became:

```text
Create
  → Wait
  → Poll
  → Branch
  → Retry
  → Fetch Metadata
  → Paginate
  → Fan Out
  → Download
  → Track
  → Reconcile
```

And around that workflow we also had:

```text
1M+ recordings/day
Multi-tenancy
Missing-recording detection
Concurrency
Idempotency
Partial failures
Long-running asynchronous operations
Recovery
```

At this point the conclusion became clear:

> **We didn't have a file-transfer problem anymore.**
>
> **We had an orchestration problem.**

---

## 14. Why a State Machine?

The reconciliation workflow naturally contains state:

```text
Create Export
    ↓
Wait
    ↓
Check Status
    ↓
┌───────────────┐
│ Still Running │──→ Wait → Check Again
└───────────────┘
    ↓
Complete?
    ↓
Get Metadata
    ↓
Fan Out
    ↓
Download
    ↓
Track Completion
```

The process has:

- asynchronous external operations;
- unpredictable waiting periods;
- branches;
- retries;
- failure handling;
- parallel execution;
- persisted state;
- potentially long-running executions.

Those characteristics led us to evaluate orchestration/state-machine approaches, including alternatives such as Spring State Machine and other AWS/event-driven approaches.

The eventual choice was:

> **AWS Step Functions**

The implementation used TypeScript and AWS services around the state-machine workflow.

Step Functions gave us a natural representation of the reconciliation lifecycle rather than forcing us to implement orchestration manually inside application code.

---

# Part II — The Problem After the Architecture Was Solved

## 15. Great. Now We Just Had to Build It.

Choosing Step Functions solved the architecture problem.

Then we discovered the development problem.

A state machine orchestrating multiple Lambdas and AWS services is very different from developing a single service locally.

The workflow had:

- multiple Lambda executions;
- waits;
- polling loops;
- branches;
- retries;
- DynamoDB state/tracking;
- queues;
- S3;
- parallel executions;
- distributed logs.

And now the question became:

> **How do you develop and debug a distributed state machine locally?**

---

## 16. Why Does Developing This Suck?

The initial development experience exposed several problems:

### Slow Deployment Cycles

Small changes could require deploying infrastructure before we could execute the workflow in a realistic environment.

### Poor Local Development Support

At the time, AWS SAM did not provide the local Step Functions development experience we needed for this architecture.

We could work with individual functions, but reproducing the entire orchestration locally was the real challenge.

### Distributed Debugging

A single business operation could cross multiple states and Lambda executions.

Understanding a failure meant reconstructing the execution path across distributed components.

### CloudWatch Log Hunting

Debugging frequently meant moving between Step Functions execution information and CloudWatch logs for individual functions.

The information existed, but the feedback loop was painful.

### Long Feedback Loops

The development cycle started looking like:

```text
Change Code
   ↓
Deploy
   ↓
Trigger Workflow
   ↓
Wait
   ↓
Find Execution
   ↓
Find Relevant Lambda
   ↓
Find CloudWatch Logs
   ↓
Understand Failure
   ↓
Change Code
   ↓
Repeat
```

For a complex state machine, that becomes expensive very quickly.

---

## 17. The Real Development Requirement

We needed something closer to:

```text
Change Code
   ↓
Deploy Locally
   ↓
Run State Machine
   ↓
Inspect Execution
   ↓
Fix
   ↓
Run Again
```

We wanted the development feedback loop to happen primarily on the developer's machine while still exercising the actual architecture.

The goal was not to mock away Step Functions.

The goal was to **run the architecture locally**.

---

## 18. Enter LocalStack

LocalStack gave us the ability to reproduce the AWS architecture locally, including the services required by the workflow.

For this project that included services such as:

- AWS Step Functions;
- Lambda;
- DynamoDB;
- SQS;
- S3.

Instead of replacing our architecture with mocks, we could run a locally deployable version of the actual system.

That was the turning point.

> **LocalStack didn't change the architecture. It changed the development feedback loop.**

---

## 19. Local Development Was More Than Starting LocalStack

Running the AWS services locally was only part of the solution.

A complex Step Functions workflow still needed developer tooling around it.

We created scripts and tooling to automate and simplify tasks such as:

- starting the local environment;
- deploying the state machine locally;
- deploying/updating Lambdas;
- preparing test data;
- triggering executions;
- inspecting execution state;
- tracing logs across the execution;
- resetting local resources;
- reproducing scenarios quickly.

We also created tooling to make cloud execution/log inspection easier when we needed to compare local behavior with deployed environments.

LocalStack became the foundation for a much tighter developer workflow.

---

## 20. Before and After

### Before

```text
Code
 ↓
Deploy to AWS
 ↓
Wait
 ↓
Execute
 ↓
Step Functions Console
 ↓
CloudWatch
 ↓
Find Lambda
 ↓
Find Logs
 ↓
Debug
 ↓
Repeat
```

### With LocalStack

```text
Code
 ↓
Local Deploy
 ↓
Execute
 ↓
Inspect
 ↓
Debug
 ↓
Repeat
```

The architecture did not become less distributed.

The feedback loop became dramatically more local and controllable.

---

## 21. The Story in Four Sentences

The entire journey can be summarized as:

> **The business problem was simple:** get call recordings into Capital One.
>
> **The reliability problem was not:** don't lose recordings and know when something is missing.
>
> **The architecture solved that with orchestration:** AWS Step Functions.
>
> **Then we discovered a new problem:** developing and debugging that architecture efficiently.

That final problem is where LocalStack enters the story.

---

# Core Narrative

The talk should avoid presenting LocalStack as a technology we simply decided to use.

The audience should progressively discover why it became necessary.

The narrative arc is:

```text
Simple Business Goal
        ↓
Real-World Constraints
        ↓
Push Is Not Enough
        ↓
Need to Detect Missing Recordings
        ↓
Recording Tracker
        ↓
Reconciliation
        ↓
Async Export Workflow
        ↓
Orchestration Problem
        ↓
AWS Step Functions
        ↓
Architecture Solved
        ↓
Development Experience Problem
        ↓
LocalStack
        ↓
Fast Local Feedback Loop
```

---

# Potential Slide / Section Hooks

## Opening

> **The goal was simple: get the recordings.**

Followed by:

> **How hard could that be?**

## Scale Reveal

> **1,000,000+ calls. Every day.**

## Reliability Reveal

> **“We got most of them” isn't good enough.**

## Missing Recording Problem

> **How do we know which recordings never arrived?**

## Tracker

> **You can't detect a missing recording if you only track the recordings you received.**

## Export Complexity

> **Creating the export was easy. Waiting for it correctly was harder.**

## Architecture Transition

> **We didn't have a file-transfer problem anymore. We had an orchestration problem.**

## Development Transition

> **Great. Architecture solved. Now we just had to build it.**

## Local Development Problem

> **How do you develop and debug a distributed state machine locally?**

## LocalStack Reveal

> **This is where LocalStack enters the story.**

## Key LocalStack Message

> **LocalStack didn't change the architecture. It changed the feedback loop.**

---

# Key Takeaways

1. **Simple business requirements can hide distributed-system complexity.** Moving a recording was easy; guaranteeing completeness was not.

2. **The primary path and recovery path are equally important.** A highly scalable push mechanism still needs a way to detect and recover what it missed.

3. **Tracking expected outcomes is fundamental to reconciliation.** You cannot identify missing artifacts by observing only successful arrivals.

4. **Asynchronous vendor APIs naturally create orchestration problems.** Waits, polling, branching, retries, pagination, and fan-out are state-machine concerns.

5. **Step Functions solved the orchestration problem but introduced a development-experience challenge.** Distributed workflows can be difficult and slow to iterate on when every meaningful test depends on cloud deployment.

6. **LocalStack made the architecture practical to develop locally.** It allowed us to exercise the AWS architecture with a much shorter feedback loop rather than replacing important behavior with mocks.

7. **The real win was developer feedback speed.** The value was not simply “AWS on a laptop”; it was the ability to experiment, debug, test, and iterate on a complex state machine without making the cloud deployment cycle the center of development.

---

# Talk Title

## **How LocalStack Saved the State Machine (Step Functions)**

A story about how a seemingly simple file-transfer requirement became a large-scale reconciliation and orchestration problem—and how solving the architecture exposed an entirely different problem: developing that architecture efficiently.
