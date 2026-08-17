# How LocalStack Saved the State Machine (AWS Step Functions)

## Subtitle

**Building, Debugging, and Scaling Complex Step Functions Locally with
LocalStack, AI, and Spec-Driven Development**

------------------------------------------------------------------------

# Abstract

At first, this project had nothing to do with LocalStack.

The goal was to build an enterprise-scale Call Recording platform
capable of ingesting more than one million recordings per day into
Capital One while guaranteeing that **no recording would ever be lost**.

Designing the architecture required evaluating multiple AWS services,
orchestration patterns, and distributed workflows. We validated every
major decision through experiments before writing production code.

Then we hit an unexpected problem.

Developing AWS Step Functions locally was far more difficult than
designing the production architecture itself.

At the time, AWS SAM did not provide practical support for fully local
Step Function development. Every change required deployments, pipelines,
remote debugging, and manually correlating logs across multiple Lambda
functions.

That challenge completely changed the project.

Instead of accepting a slow cloud-first development cycle, we built a
local-first engineering platform around **LocalStack**.

We created tooling that could:

-   Run Step Functions, Lambda, DynamoDB, SQS and S3 locally.
-   Deploy the same CDK infrastructure used in production.
-   Prepare local test data automatically.
-   Execute complete workflows locally.
-   Correlate distributed logs across every Lambda execution.
-   Visualize Step Function executions and state transitions through a
    dedicated UI.
-   Retrieve and visualize traces from local, Development and QA
    environments.

The result wasn't just a production platform.

It was a development platform that dramatically reduced the cost of
experimentation.

Throughout the talk we also show how AI (Cloud Code) and Uncle Dev
enabled rapid experimentation, Spec-Driven Development, architecture
validation, documentation and implementation.

The main takeaway is not how to build Step Functions.

It is how investing in local tooling, observability and experimentation
fundamentally changes the speed and quality of engineering decisions.

------------------------------------------------------------------------

# Talk Flow

## 1. The business problem

Why a simple file transfer became a distributed systems problem.

## 2. Architecture through experimentation

How experiments led us to Fargate, Step Functions and asynchronous
workflows.

## 3. The unexpected bottleneck

Why local Step Function development became the biggest engineering
challenge.

## 4. LocalStack to the rescue

Building a complete local AWS environment.

## 5. Building the missing tooling

Automation, CDK deployment, distributed tracing and workflow
visualization.

## 6. AI as an engineering accelerator

How Cloud Code and Uncle Dev accelerated experimentation rather than
simply generating code.

## 7. Lessons learned

Why reducing feedback loops matters more than choosing the "perfect"
architecture.

------------------------------------------------------------------------

# Core Message

> **LocalStack didn't just let us run AWS locally. It transformed how we
> designed, tested and evolved complex Step Function workflows by making
> experimentation inexpensive and immediate.**
