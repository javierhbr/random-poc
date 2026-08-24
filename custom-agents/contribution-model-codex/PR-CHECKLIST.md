# Pull Request Checklist

## Contributor

- [ ] I classified the change: fix / improvement / extension / new capability / governance.
- [ ] I identified every affected capability.
- [ ] The capability responsibility remains clear and bounded.
- [ ] I checked for existing capabilities before adding a new one.
- [ ] Inputs and outputs are defined.
- [ ] Permissions and mutations are explicit.
- [ ] I did not silently expand privileges.
- [ ] Behavioral changes include appropriate behavioral tests.
- [ ] Bug fixes include a regression scenario where practical.
- [ ] Missing or uncertain information is handled explicitly.
- [ ] Important conclusions can be traced to evidence.
- [ ] Documentation/examples are updated.
- [ ] Provider/harness-specific behavior is declared.
- [ ] I identified any principle or governance impact.

## Automated Validation

- [ ] Static validation passes.
- [ ] Capability contract validation passes.
- [ ] Required scenario tests pass.
- [ ] Principle validation passes.
- [ ] Permission/safety checks pass where applicable.
- [ ] Regression comparison is acceptable.
- [ ] Required harness compatibility tests pass.

## Maintainer

- [ ] The contribution solves a real problem.
- [ ] Scope is appropriate.
- [ ] The project philosophy is preserved.
- [ ] Architecture remains coherent.
- [ ] Trust/risk classification is appropriate.
- [ ] New capability is placed at the correct maturity level.
- [ ] Governance changes received explicit review.
