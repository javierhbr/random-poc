# Call Recording: From a "Simple File Transfer" to a Distributed Enterprise Platform

## 1. The Challenge

At first glance, the problem sounded trivial.

> A customer finishes an IVR call, an audio recording is generated, and
> that recording must be transferred into Capital One.

Simple.

Except it wasn't.

The platform processes more than **1 million calls every day**,
generating more than **1 million audio files daily**, each averaging
**5--6 MB**. Every recording is business-critical and **none can be
lost**.

That requirement changed everything.

------------------------------------------------------------------------

## 2. Understanding the Constraints

Before designing anything, we evaluated every enterprise-approved
mechanism for transferring files into Capital One.

**Result:** none of them were compatible with the IVR vendor.

Waiting for new vendor capabilities wasn't an option.

The only viable integration point was the vendor's API platform.

Now the question became:

> How do we build an enterprise-scale ingestion platform using only
> APIs?

------------------------------------------------------------------------

## 3. Learning What the Vendor Could Do

The vendor exposed two completely different capabilities.

### Streaming On Demand

Immediately pushes a recording to Capital One after the call ends.

### Batch Export

Creates asynchronous export jobs that later generate ZIP files
containing thousands of recordings.

Together, these APIs became the foundation of the architecture.

------------------------------------------------------------------------

## 4. First Discovery

Experiments showed Streaming On Demand could successfully process **more
than 90%** of recordings.

Great.

But the business requirement wasn't 90%.

It was:

> **100% of recordings must exist inside Capital One.**

So another question appeared.

> How do we recover everything that streaming misses?

------------------------------------------------------------------------

## 5. Building a Recovery Strategy

The Export API solved the recovery problem.

Its workflow:

1.  Create an Export Job.
2.  Poll until completed.
3.  Retrieve metadata.
4.  Download paginated ZIP files.
5.  Extract recordings.

Later, the vendor added an API for downloading individual recordings
when only a few files were missing.

------------------------------------------------------------------------

## 6. The Real Innovation

Knowing how to export recordings wasn't enough.

The difficult problem was deciding **when** to use exports.

We built a tracking platform that follows every call.

If Streaming succeeds, the recording is marked complete.

If it doesn't arrive within the expected time window, the call
automatically enters the recovery workflow.

Nothing is manually reconciled.

Everything is driven by state.

------------------------------------------------------------------------

# Part II --- Designing the Architecture

## 7. How Do You Choose an Architecture?

The IVR Data team was busy with other strategic initiatives.

The architecture research started with essentially one engineer.

Rather than debating technologies, every decision had to be backed by
evidence.

That became the engineering principle for the project:

> **Experiment first. Implement later.**

------------------------------------------------------------------------

## 8. Research Through Experiments

Instead of opinions, we built prototypes.

We evaluated:

-   Go
-   Python
-   TypeScript
-   AWS Lambda
-   AWS Fargate
-   Containers
-   NestJS
-   Middy

Each experiment measured scalability, performance, maintainability and
operational complexity.

The winner became:

**AWS Fargate + NestJS**

Not because it was fashionable.

Because the experiments proved it was the best fit.

------------------------------------------------------------------------

## 9. A Different Problem: Export Orchestration

Processing streaming files was relatively straightforward.

Export Jobs were not.

They are long-running workflows requiring repeated polling until
completion.

Again, we experimented.

We evaluated:

-   Step Functions
-   State Machines
-   Saga
-   Event-Driven Architecture
-   Multiple frameworks and languages

The winning solution became **AWS Step Functions + TypeScript**.

------------------------------------------------------------------------

## 10. When Experiments Change Your Mind

Step Functions charge for state transitions.

Initially we believed polling would become expensive.

So we built another architecture.

Instead of waiting inside Step Functions:

-   Schedule EventBridge.
-   Wake up later.
-   Poll again.
-   Repeat.

It worked perfectly.

But when we analyzed real production volumes, we learned something
important.

The number of Export Jobs was much smaller than expected.

The cost savings no longer justified the additional complexity.

The simpler architecture won.

That lesson repeated throughout the project.

------------------------------------------------------------------------

## 11. Heavy File Processing

Downloading thousands of ZIP files is not a Lambda problem.

Instead:

Step Functions orchestrate.

SQS distributes work.

Fargate downloads files.

S3 stores recordings.

Fargate sends the callback.

Step Functions continue.

Each service performs the task it does best.

------------------------------------------------------------------------

# Part III --- Building the Platform

## 12. From Research to Delivery

Once the architecture was selected, implementation began.

Initially the project was developed almost entirely by one engineer.

Later two additional engineers joined.

Because everything was documented through Spec-Driven Development,
onboarding became straightforward.

Every architectural decision, specification, implementation detail and
test already existed inside the repository.

------------------------------------------------------------------------

## 13. AI as an Engineering Accelerator

None of the experimentation cycle would have been practical without AI
assistance.

Cloud Code provided the reasoning model.

Uncle Dev provided the engineering harness.

Together they accelerated:

-   architecture research,
-   experimentation,
-   documentation,
-   implementation,
-   testing,
-   performance validation.

The biggest gain wasn't writing code faster.

It was reducing the cost of validating ideas.

------------------------------------------------------------------------

## 14. Platform Milestones

The project became the first IVR initiative adopting:

-   the new platform SDK,
-   a monorepo,
-   independently deployable services,
-   independently deployable Step Functions.

The repository became the single source of truth for both implementation
and knowledge.

------------------------------------------------------------------------

# 15. Final Lessons

This project was never really about transferring audio files.

It was about making engineering decisions under uncertainty.

Every major decision followed exactly the same pattern:

1.  Understand the problem.
2.  Build a small experiment.
3.  Measure.
4.  Compare alternatives.
5.  Choose the simplest solution supported by evidence.

Artificial Intelligence never replaced engineering judgment.

It dramatically reduced the cost of reaching it.

That may be the most important outcome of the entire project.

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
