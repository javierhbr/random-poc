Perfect. With that addition, the idea becomes much clearer: a **100% JSON-configurable interview evaluation application** that enables quick observation capture and generates editable feedback.

The key is to separate three things: **the interview definition, the captured observations, and the final feedback.**

# 1. Conceptual Architecture

### Interview Template (JSON)

Defines the objectives, exercises, criteria, options, and rules used to generate feedback.

### Dynamic Interview UI

Automatically renders the forms and controls based on the JSON configuration.

### Captured Observations

Quick selections, additional notes, and evidence captured for each criterion.

### Editable Feedback

Automatically generated text that is fully editable and ready to copy.

# 2. JSON as the Single Source of Configuration

The application should not need to understand what a programming exercise, communication question, or prompt-engineering exercise actually is.

It should simply interpret a configuration that specifies:

| Element | Configurable in JSON |
|---|---|
| Interview | Name, description, version |
| Objectives | Global competencies to evaluate |
| Sections | Exercises, questions, and subquestions |
| Criteria | Behaviors or evidence to observe |
| Input Type | Checkbox, single selection, scale, text |
| Options | Specific options available for each criterion |
| Feedback Mapping | Text associated with each response |
| Evidence Mapping | Global objectives associated with each criterion |
| Output Structure | Sections and formatting of the generated feedback |

For example, one criterion might have four possible options while another has only two. Both should work within the same UI.

It should even be possible to add a new exercise or an entirely different type of interview **without modifying the application code**, as long as the configuration uses supported input components.

# 3. Editable Feedback Generation

This would be one of the most important components.

Instead of generating an immutable document, the application should generate an **editable draft**, preferably inside a sufficiently large textarea.

### Interview Feedback

Editable output example:

**Draft**

[Editable textarea]

The interviewer can edit, add, or remove any part of the generated text.

**[Copy]**

During the interview, the interviewer selects options and adds quick notes. Afterward, the system generates the corresponding feedback paragraphs, leaving only the final adjustments to the interviewer.

I would also include two additional mechanisms:

- **Free-form notes per exercise or criterion:** Used to capture unexpected situations, behaviors, or observations that were not anticipated in the JSON configuration.
- **Free-form comments in the final feedback:** Used to supplement, modify, or remove any automatically generated content.

One important detail: if the interviewer manually edits the generated feedback and then changes a checklist selection, **the system should not overwrite the interviewer’s manual changes**.

Instead, it could propose an updated version or indicate that the underlying observations have changed, while leaving the decision to apply those changes to the interviewer.

# 4. Conceptual JSON Configuration Example

Without getting into implementation details, part of an interview template could look like this:

```json
{
  "interviewId": "ai-problem-solving",
  "version": "1.0",
  "name": "AI-Assisted Problem Solving",
  "globalObjectives": [
    {
      "id": "critical-thinking",
      "name": "Critical Thinking"
    },
    {
      "id": "communication",
      "name": "Communication"
    }
  ],
  "sections": [
    {
      "id": "exercise-1",
      "name": "Prompt Engineering",
      "criteria": [
        {
          "id": "prompt-quality",
          "label": "Created a detailed prompt",
          "type": "single-select",
          "allowNotes": true,
          "objectives": [
            "critical-thinking"
          ],
          "options": [
            {
              "value": "detailed",
              "label": "Detailed",
              "feedback": "The candidate created a detailed and well-structured prompt."
            },
            {
              "value": "basic",
              "label": "Basic",
              "feedback": "The candidate created a basic prompt with limited context."
            },
            {
              "value": "not-done",
              "label": "Not Done",
              "feedback": "The candidate did not demonstrate prompt construction."
            },
            {
              "value": "not-observed",
              "label": "Not Observed",
              "feedback": ""
            }
          ]
        }
      ]
    }
  ]
}
```

The JSON does more than define which options appear in the UI. It also defines the meaning of each selection and how that selection contributes to the evaluation.

In this example, selecting **Detailed** creates a positive observation, **Basic** generates a more limited observation, and **Not Observed** does not automatically imply a negative result.

# 5. Three Main Screens for the First Version

## Interview Setup

Select an interview JSON template, review its configured objectives and exercises, and start a new evaluation.

---

## Interview Session

Navigate between exercises, record observations with one or two clicks, and add free-form notes without disrupting the flow of the interview.

The primary objective of this screen should be **speed**. The interviewer should spend as little time as possible interacting with the application.

---

## Feedback Review

Generate feedback from the captured observations, edit it inside a textarea, review missing evidence, and copy the final result.

# 6. An Important Additional Distinction

I would separate **evidence-based feedback** from the **final recommendation**.

For example, the fact that a candidate did not create a detailed prompt does not necessarily mean they demonstrated poor critical thinking. They may have solved the problem using a different but equally effective approach.

The system should therefore help aggregate observations and connect them to global objectives, but it should **not automatically produce a Hire / No Hire decision simply by adding up checkboxes**.

The final recommendation should remain with the interviewer, using the captured evidence and the evaluation criteria defined by the company.

In other words:

**Observation → Evidence → Objective → Human Judgment**

rather than:

**Checkboxes → Score → Automatic Hiring Decision**

# 7. Recommended Initial Scope

For an MVP, I would keep the scope limited to:

1. JSON templates that fully describe each interview type.
2. A dynamic UI with configurable options and additional notes.
3. Captured observations stored separately from the interview template configuration.
4. Feedback generation using predefined text and simple rules.
5. A free-form feedback editor with copy-to-clipboard functionality.
6. Temporary local storage of the interview session to prevent losing observations.

Initially, I would **not** include AI, complex automatic scoring, integrations with recruiting systems, or a visual template editor.

JSON configuration should be sufficient to define the interviews, evaluation criteria, and feedback-generation rules.

# Concept Name

A good working name for the concept would be:

**Interview Feedback Composer**

And I would establish one central design principle:

> **“Capture observations, not sentences. Compose feedback, don’t rewrite it.”**

During the interview, the interviewer captures facts and observations with as little friction as possible.

Once the interview is complete, the system transforms those observations into a structured feedback draft that the interviewer can review, modify, and complete.