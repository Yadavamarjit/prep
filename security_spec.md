# Security Specification - CPO Master

## 1. Data Invariants
- A user can only access their own profile and events.
- An event must belong to the logged-in user (`userId` match).
- Event timestamps must be valid numbers.
- Subject and Type must be within allowed enums.

## 2. The "Dirty Dozen" Payloads (Denial Expected)
1. Creating a profile for a different `uid`.
2. Updating a profile's `overallProgress` by a user who doesn't own it.
3. Creating an event where `userId` does not match `request.auth.uid`.
4. Updating an event's `userId` to a different user.
5. Creating an event with an invalid `type` (e.g., "party").
6. Creating an event with an invalid `subject` (e.g., "Physics").
7. Updating an event's `startTime` to a string instead of a number.
8. Deleting someone else's event.
9. Listing events from a different user's subcollection without proper `where` clause (though rules enforce it).
10. Creating an event with a massive description (1MB+) - enforced by `.size()`.
11. Updating a terminal status (if we had one) or bypassing validation.
12. Injecting shadow fields into a profile update.

## 3. Test Runner (Conceptual)
`firestore.rules.test.ts` would verify that `auth.uid != userId` always results in `PERMISSION_DENIED`.
