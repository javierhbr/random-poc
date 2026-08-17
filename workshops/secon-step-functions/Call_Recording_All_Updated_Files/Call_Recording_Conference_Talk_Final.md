# Call Recording: Engineering Under Uncertainty

### A story about architecture, experimentation, and AI-assisted engineering

> **Theme:** This is not a story about moving audio files. It is a story
> about reducing engineering uncertainty through rapid experimentation.

------------------------------------------------------------------------

# Slide 1 --- It Looked Easy

"A customer finishes a phone call. An audio file is generated. Move the
file into Capital One."

That was the entire requirement.

Or so we thought.

**Question to the audience**

*What could possibly make this difficult?*

------------------------------------------------------------------------

# Slide 2 --- Then Reality Appeared

The platform processes:

-   1M+ calls/day
-   1M+ recordings/day
-   5--6 MB each
-   Zero recordings may be lost

Now it isn't a file transfer problem.

It's a distributed systems problem.

**Next question**

How do we guarantee 100% delivery?

------------------------------------------------------------------------

# Slide 3 --- First Constraint

We evaluated every approved enterprise ingestion mechanism.

None were compatible with the vendor.

Waiting for vendor changes wasn't possible.

We had one option:

**Build everything around APIs.**

**Next question**

What APIs do we actually have?

------------------------------------------------------------------------

# Slide 4 --- Two APIs

The vendor exposed:

-   Streaming On Demand
-   Batch Export

Streaming looked promising.

Exports looked painful.

------------------------------------------------------------------------

# Slide 5 --- First Experiment

Could Streaming handle enterprise scale?

We built prototypes.

We measured.

Result:

Streaming handled more than 90%.

Fantastic.

Except...

Business needed 100%.

**Next question**

How do we recover the missing 10%?

------------------------------------------------------------------------

# Slide 6 --- The Recovery Problem

Batch Export can recover recordings.

But it's asynchronous.

Create Job.

Poll.

Wait.

Download metadata.

Download ZIP files.

Extract recordings.

Simple workflow.

Complex orchestration.

------------------------------------------------------------------------

# Slide 7 --- The Real Problem

The APIs weren't the challenge.

The challenge was deciding **when** to use them.

We built a tracking platform.

Every call has a lifecycle.

Every recording has a state.

Missing recordings automatically trigger recovery.

No manual reconciliation.

------------------------------------------------------------------------

# Slide 8 --- Architecture by Experiment

We refused to choose technology first.

Instead we asked:

"What experiment answers today's question?"

We evaluated:

-   Go
-   Python
-   TypeScript
-   Lambda
-   Fargate
-   Containers
-   NestJS
-   Middy

Evidence drove every decision.

------------------------------------------------------------------------

# Slide 9 --- First Decision

Winner:

Fargate + NestJS.

Not because it was trendy.

Because measurements said so.

------------------------------------------------------------------------

# Slide 10 --- Another Unknown

Export orchestration.

Step Functions?

Saga?

State Machines?

Event-driven?

More experiments.

------------------------------------------------------------------------

# Slide 11 --- A Surprising Lesson

We optimized polling costs.

Built an EventBridge scheduler solution.

It worked.

Then production estimates arrived.

The optimization wasn't worth the complexity.

We deleted the clever solution.

Sometimes engineering means removing ideas.

------------------------------------------------------------------------

# Slide 12 --- Final Architecture

Step Functions orchestrate.

SQS distributes.

Fargate downloads.

S3 stores.

Callbacks resume workflows.

Each service has one responsibility.

------------------------------------------------------------------------

# Slide 13 --- How Was This Possible?

Most architecture research started with essentially one engineer.

Normally this would take months.

Instead we continuously:

-   Ask a question
-   Build an experiment
-   Measure
-   Decide

------------------------------------------------------------------------

# Slide 14 --- AI's Real Contribution

Cloud Code wasn't replacing engineering.

Uncle Dev wasn't writing magic code.

Together they reduced the cost of experimentation.

That changed everything.

Instead of arguing...

We measured.

------------------------------------------------------------------------

# Slide 15 --- Spec-Driven Development

Documentation.

Architecture.

Implementation.

Testing.

Performance.

Everything lived together.

New engineers joined without tribal knowledge.

The repository became the source of truth.

------------------------------------------------------------------------

# Slide 16 --- Results

-   Enterprise-scale platform
-   Resilient architecture
-   Fast onboarding
-   Regulatory deadlines met
-   Architecture validated through evidence

------------------------------------------------------------------------

# Closing

The biggest lesson wasn't Fargate.

It wasn't Step Functions.

It wasn't AI.

It was this:

> **Good engineering is not choosing the smartest architecture.**
>
> **Good engineering is reducing uncertainty until the right
> architecture becomes obvious.**

That is what experimentation, Spec-Driven Development, Cloud Code, and
Uncle Dev enabled us to do.

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
