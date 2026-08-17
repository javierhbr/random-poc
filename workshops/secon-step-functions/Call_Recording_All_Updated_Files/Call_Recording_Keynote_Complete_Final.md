# Call Recording: Engineering Under Uncertainty

## Conference Talk (Slides + Speaker Notes)

> **Theme:** This is not a story about transferring audio files. It is a
> story about reducing engineering uncertainty through rapid
> experimentation.

------------------------------------------------------------------------

# Slide 1 --- Title

## Call Recording: Engineering Under Uncertainty

**A story of architecture, experimentation, and AI-assisted
engineering**

**Speaker notes**

Introduce yourself and set expectations.

"This isn't a talk about AWS services or moving audio files. It's a
story about how we reduced uncertainty while designing an enterprise
platform."

Transition:

> "Let's start with the requirement."

------------------------------------------------------------------------

# Slide 2 --- The Requirement

-   Call ends.
-   Audio recording is generated.
-   Transfer it into Capital One.

**Speaker notes**

At first glance this sounds like a one-line requirement.

Ask the audience:

> "What could possibly make this difficult?"

Pause.

Then move to the next slide.

------------------------------------------------------------------------

# Slide 3 --- Reality

-   1M+ calls/day
-   1M+ recordings/day
-   Average size: 5--6 MB
-   Zero recordings may be lost

**Speaker notes**

Explain that this immediately stopped being a file-transfer problem.

It became a distributed systems problem.

Transition:

> "The next surprise wasn't technical. It was integration."

------------------------------------------------------------------------

# Slide 4 --- Constraint #1

-   Evaluated every approved ingestion mechanism.
-   None were compatible with the vendor.
-   APIs became the only viable integration point.

**Speaker notes**

Explain that waiting for vendor changes was not an option.

So the architecture had to be designed around the APIs that already
existed.

Transition:

> "What APIs did we actually have?"

------------------------------------------------------------------------

# Slide 5 --- Vendor APIs

-   Streaming On Demand
-   Batch Export

**Speaker notes**

Explain both capabilities briefly.

One pushes recordings immediately.

The other creates asynchronous export jobs.

These became the building blocks of the platform.

------------------------------------------------------------------------

# Slide 6 --- Experiment #1

Question:

> Can Streaming scale?

Result:

-   More than 90% success.

Business requirement:

-   100%.

**Speaker notes**

Celebrate the success for a moment.

Then immediately explain why 90% is still failure when the requirement
is zero data loss.

Transition:

> "How do we recover the missing recordings?"

------------------------------------------------------------------------

# Slide 7 --- Recovery

Workflow:

1.  Create Export Job.
2.  Poll.
3.  Retrieve metadata.
4.  Download ZIP files.
5.  Process recordings.

**Speaker notes**

The export API solved recovery.

But introduced another problem:

Long-running orchestration.

------------------------------------------------------------------------

# Slide 8 --- The Innovation

Tracking every call.

Tracking every recording.

Streaming succeeds?

Done.

Streaming fails?

Automatic recovery.

**Speaker notes**

The APIs weren't the innovation.

The tracking system was.

Everything became state-driven.

------------------------------------------------------------------------

# Slide 9 --- Research

We experimented instead of debating.

Technologies evaluated:

-   Go
-   Python
-   TypeScript
-   Lambda
-   Fargate
-   Containers
-   NestJS
-   Middy

**Speaker notes**

Every decision was backed by measurements.

Not opinions.

------------------------------------------------------------------------

# Slide 10 --- Decision #1

Winner:

**AWS Fargate + NestJS**

**Speaker notes**

Explain why.

Performance.

Scalability.

Maintainability.

Operational simplicity.

------------------------------------------------------------------------

# Slide 11 --- Export Challenge

Problem:

Polling long-running workflows.

Alternatives:

-   Step Functions
-   Saga
-   State Machines
-   Event-driven architectures

**Speaker notes**

A completely different engineering problem than streaming.

------------------------------------------------------------------------

# Slide 12 --- Decision #2

Winner:

AWS Step Functions.

**Speaker notes**

Chosen because of simplicity, resiliency and team familiarity.

------------------------------------------------------------------------

# Slide 13 --- Interesting Twist

We optimized polling costs.

Built an EventBridge Scheduler solution.

It worked.

Then we removed it.

**Speaker notes**

Real production numbers changed the economics.

The simpler architecture became the better architecture.

Great engineering sometimes means deleting clever code.

------------------------------------------------------------------------

# Slide 14 --- Final Architecture

Step Functions

↓

SQS

↓

Fargate

↓

S3

↓

Callback

↓

Step Functions

**Speaker notes**

Each service has one responsibility.

Everything remains asynchronous.

Everything remains resilient.

------------------------------------------------------------------------

# Slide 15 --- Development

Spec-Driven Development.

Cloud Code.

Uncle Dev.

Single source of truth.

**Speaker notes**

Cloud Code accelerated reasoning.

Uncle Dev accelerated experimentation.

The biggest benefit wasn't writing code.

It was making decisions faster.

------------------------------------------------------------------------

# Slide 16 --- Results

-   Enterprise-scale solution
-   Delivered on time
-   Fast onboarding
-   Architecture validated experimentally

**Speaker notes**

Emphasize the engineering process.

Not the AWS services.

------------------------------------------------------------------------

# Slide 17 --- Lessons Learned

1.  Understand the problem.
2.  Build an experiment.
3.  Measure.
4.  Compare.
5.  Simplify.
6.  Implement.

**Speaker notes**

This pattern repeated throughout the entire project.

------------------------------------------------------------------------

# Slide 18 --- Closing

> Good engineering is not choosing the smartest architecture.

> Good engineering is reducing uncertainty until the right architecture
> becomes obvious.

**Speaker notes**

Leave the audience with this final thought.

Artificial Intelligence didn't replace engineering judgment.

It dramatically reduced the cost of reaching good engineering decisions.

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
