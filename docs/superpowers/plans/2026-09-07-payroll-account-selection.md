# Payroll account selection

## Scope

- Add the six required payroll accrual account IDs to the calculation form, payload, and validation.
- Reuse document-account selectors without auto-selecting or locking the user’s payroll choices.
- Show saved document accounts and backend-provided debit/credit pairs in payroll details.
- Keep legacy documents with nullable account fields readable.
- Align payroll component and payment contracts with the new API fields where the existing UI already owns those forms.

## Verification

- Run TypeScript/build checks and the repository test command.
- Review the final diff for unrelated module changes.
