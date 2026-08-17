# Call Recording Project -- From Architecture Research to Implementation

# 1. Context

The **Call Recording** project is responsible for ensuring that every
call recorded by the IVR platform is securely ingested into Capital One.

At first glance, the problem appears simple: a call ends, an audio file
is generated, and that file must be transferred into Capital One.

In reality, the solution required solving a large-scale distributed
systems problem involving millions of files, multiple asynchronous
workflows, resiliency, and long-running orchestration.

------------------------------------------------------------------------

# 2. Initial Decisions

The first step was selecting the IVR vendor responsible for generating
and managing call recordings.

Once the vendor was selected, we analyzed the capabilities and
constraints of its platform to determine the overall architecture.

------------------------------------------------------------------------

# 3. Integration Constraints

We evaluated every approved mechanism available for transferring files
into Capital One.

**Disclaimer:** None of the approved enterprise file-transfer mechanisms
were compatible with the vendor's platform. Waiting for the vendor to
implement those capabilities was not an option, so the solution had to
be built entirely around the vendor's APIs.

------------------------------------------------------------------------

# 4. Vendor Capabilities

The vendor exposed two primary mechanisms:

1.  Streaming On Demand
2.  Batch Export APIs

These two capabilities became the foundation of the architecture.

------------------------------------------------------------------------

# 5. Option 1 -- Streaming On Demand

When a call finishes, the vendor generates the recording and immediately
streams the audio to a Capital One API.

Initially we did not know whether this mechanism would scale.

The platform processes more than **one million calls per day**,
producing more than one million audio files daily, each averaging 5--6
MB.

After experimentation, we concluded Streaming On Demand successfully
handled over **90%** of all recordings.

However, processing 90% was not enough.

The business requirement was clear:

> **No recording can ever be lost.**

That requirement introduced the need for a second recovery mechanism.

------------------------------------------------------------------------

# 6. Option 2 -- Batch Export

The vendor also provides a Batch Export API.

Instead of exporting individual calls immediately, it creates an export
containing every recording inside a requested time window.

The workflow is:

1.  Create Export Job.
2.  Poll until the job completes.
3.  Retrieve export metadata.
4.  Download paginated ZIP files.
5.  Extract and process recordings.

This mechanism is capable of recovering the remaining recordings that
Streaming does not deliver.

Later, the vendor also introduced a single-recording download API for
recovering only a few missing files.

------------------------------------------------------------------------

# 7. Tracking Missing Recordings

Knowing how to export recordings is only half the problem.

The platform also needed to determine **when** to trigger exports.

To accomplish this, we implemented a tracking system.

Every IVR call is tracked through its lifecycle.

If Streaming delivers the recording successfully, the call is marked as
completed.

If the recording does not arrive within an expected time window, the
system automatically schedules a recovery using the Export APIs.

This guarantees every recording eventually reaches Capital One.

------------------------------------------------------------------------

# 8. Designing the Solution

The architecture needed to support enterprise-scale workloads while
remaining extensible and maintainable.

At project kickoff, the IVR Data team was occupied with other
initiatives, so the architectural research began with a single engineer.

Every decision therefore had to be supported by measurable evidence.

------------------------------------------------------------------------

# 9. Research Through Experiments

Rather than selecting technologies based on preference, we built small
experiments.

We evaluated:

-   Go
-   Python
-   TypeScript
-   AWS Lambda
-   AWS Fargate
-   Containers
-   NestJS
-   Middy

Performance, scalability, operational complexity and maintainability
were measured before any implementation began.

The result was **AWS Fargate + NestJS**, which provided the best balance
for long-term support.

------------------------------------------------------------------------

# 10. Designing the Export Workflow

The Export workflow introduced a different challenge.

The complexity was not downloading files.

It was orchestrating a long-running asynchronous workflow that
repeatedly polls the Export Job until completion.

Multiple orchestration approaches were evaluated:

-   AWS Step Functions
-   State Machines
-   Saga Pattern
-   Event-Driven Architecture
-   Java Spring
-   TypeScript

After experimentation, the team selected **AWS Step Functions
implemented in TypeScript**.

------------------------------------------------------------------------

# 11. Optimizing Polling Costs

Step Functions charge for state transitions.

Initially, we believed the polling loop could become expensive.

An alternative architecture was built using **EventBridge Scheduler**.

Instead of waiting inside Step Functions:

-   schedule an EventBridge trigger,
-   terminate execution,
-   wake up later,
-   check status,
-   repeat.

The experiments proved both architectures worked.

However, after estimating the real production workload, the number of
Export Jobs was much smaller than originally expected.

The operational simplicity of keeping the polling loop inside Step
Functions outweighed the small cost savings of EventBridge.

The simpler architecture won.

------------------------------------------------------------------------

# 12. Download Service

Downloading large ZIP files was not a good fit for Lambda.

Instead:

-   Step Functions publish work to Amazon SQS.
-   AWS Fargate consumes the queue.
-   Fargate downloads the export.
-   Files are uploaded to Amazon S3.
-   Fargate invokes the Step Functions callback API.
-   The workflow resumes.

This separated orchestration from heavy file processing while preserving
workflow state.

------------------------------------------------------------------------

# 13. Development Process

The same experimentation mindset continued during implementation.

Instead of debating architectural ideas, we rapidly validated hypotheses
using small prototypes.

Cloud Code served as the AI model, while Uncle Dev provided the
development harness that enabled rapid experimentation, documentation,
implementation and testing.

The biggest benefit was not writing code faster.

It was making architectural decisions faster and with greater
confidence.

------------------------------------------------------------------------

# 14. Spec-Driven Development

After selecting the architecture, implementation began.

Initially most of the implementation was performed by a single engineer
while the rest of the team remained focused on other priorities.

Later two additional engineers joined.

Because the project followed Spec-Driven Development, all documentation,
architecture decisions, implementation details and tests lived inside
the repository.

New developers could onboard quickly because the entire project context
was already documented.

------------------------------------------------------------------------

# 15. Platform Milestones

The project became the first IVR platform initiative to adopt:

-   the new SDK,
-   a monorepo architecture,
-   independently deployable components,
-   independently deployable Step Function Lambdas.

The architecture also supported performance testing, documentation and
implementation from a single source of truth.

------------------------------------------------------------------------

# 16. Outcome

Using experimentation, Spec-Driven Development, Cloud Code and Uncle
Dev, the team was able to:

-   validate architectural decisions through experiments,
-   implement a highly scalable distributed platform,
-   onboard new developers quickly,
-   complete implementation within enterprise delivery commitments,
-   satisfy critical regulatory deadlines related to Payments.

------------------------------------------------------------------------

# Final Takeaway

The most important lesson from this project is not the technologies that
were selected.

It is the engineering process.

Rather than debating architecture for weeks, we continuously:

1.  Formed a hypothesis.
2.  Built a small experiment.
3.  Measured results.
4.  Compared alternatives.
5.  Chose the simplest solution supported by evidence.

Artificial Intelligence did not make the engineering decisions.

It dramatically reduced the cost of validating ideas, allowing the team
to move faster while making better-informed architectural decisions.

------------------------------------------------------------------------

# Part IV --- Building an Enterprise Local Development Platform

## Why Local Development Became a Project of Its Own

Once implementation of the Step Functions orchestration began, we
encountered an unexpected obstacle.

At the time of this project, **AWS SAM did not provide practical support
for developing and debugging AWS Step Functions entirely locally**.

For simple Lambda functions this was manageable, but for an
orchestration composed of multiple Lambdas, asynchronous callbacks,
retries, waits, polling loops and distributed state transitions, relying
on deployments to AWS for every change would have made development
extremely slow.

Every small modification would require:

1.  Deploying infrastructure.
2.  Waiting for the pipeline.
3.  Executing the workflow remotely.
4.  Collecting logs from multiple services.
5.  Diagnosing the problem.
6.  Repeating the cycle.

This feedback loop was simply too expensive.

------------------------------------------------------------------------

## Choosing LocalStack

To eliminate this bottleneck we adopted **LocalStack** as the local
execution environment.

The goal was ambitious:

> Run the entire platform locally before deploying anything to AWS.

The local environment included:

-   AWS Step Functions
-   AWS Lambda
-   Amazon DynamoDB
-   Amazon SQS
-   Amazon S3
-   Supporting infrastructure created from the same CDK definitions used
    in production

This allowed developers to execute almost the complete distributed
system on their own machines.

------------------------------------------------------------------------

## Building the Missing Tooling

Running LocalStack solved only part of the problem.

The developer experience still required a significant amount of manual
work.

To remove that friction, I built a collection of tools and automation
scripts that:

-   prepared local infrastructure,
-   deployed the CDK stack locally,
-   generated test data,
-   executed Step Functions locally,
-   reset environments,
-   automated repetitive development tasks.

The objective was to make local execution as close as possible to the
production environment while requiring only a few commands from the
developer.

------------------------------------------------------------------------

## Distributed Tracing

Debugging a distributed workflow is fundamentally different from
debugging a single application.

A single Step Function execution can invoke many Lambda functions, each
producing independent logs.

Understanding what happened required manually correlating CloudWatch log
streams.

To solve this, I developed a tracing tool capable of:

-   collecting logs from every Lambda participating in a workflow,
-   correlating those logs into a single execution timeline,
-   following Step Function state transitions,
-   reconstructing the complete execution flow.

The same tooling also retrieves execution traces from Development and QA
environments, providing a consistent debugging experience across local
and cloud environments.

------------------------------------------------------------------------

## Visualizing Workflows

To complement the tracing system, I also built a lightweight
visualization UI.

Instead of searching through multiple log streams, developers can
visualize:

-   Step Function progress,
-   current and previous states,
-   Lambda invocations,
-   execution history,
-   correlated logs,
-   execution timing.

The UI transformed debugging from reading logs into understanding a
workflow.

------------------------------------------------------------------------

## Engineering Impact

This local-first platform dramatically reduced the development cycle.

Before this project, validating orchestration logic often required
deploying to AWS and waiting for CI/CD pipelines before a single
execution could be tested.

With the local environment:

-   implementation became faster,
-   debugging became significantly easier,
-   experimentation became inexpensive,
-   architectural ideas could be validated immediately.

Cloud Code and Uncle Dev accelerated the creation of this ecosystem,
allowing engineering effort to focus on solving business and
architectural problems instead of waiting on infrastructure.

------------------------------------------------------------------------

## Lesson Learned

One of the most valuable outcomes of this project was not the production
platform itself.

It was the development platform created around it.

By investing in tooling, automation, tracing and visualization, the team
dramatically reduced the cost of experimentation.

That capability influenced every architectural decision made throughout
the project.
