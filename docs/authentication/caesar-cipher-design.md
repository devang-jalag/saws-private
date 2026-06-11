# Caesar cipher (stage 3) - design notes

The spec just says "healthcare code clue using Caesar cipher" and leaves the actual scheme to us, so this is the proposed design. Open to changing it with the team.

A Caesar cipher shifts every letter by a fixed amount and wraps around at Z. Example with shift 3: HEALTH -> KHDOWK (H->K, E->H, A->D, L->O, T->W, H->K).

## The plan

At registration each user gets:
- a base code - a short healthcare word shown as the clue (HEALTH, CARE, WELLNESS, etc.)
- a secret shift N (1-25) that only they're told to remember

At stage 3, the system shows the base code ("enter the code for: HEALTH"), the user applies their shift and types the result, and the Lambda recomputes `caesar(baseCode, N)` from DynamoDB and compares. So the actual secret is the shift; the base code is just the visible prompt.

Stored in the users table as `cipherBaseCode` and `cipherShift`. (Could instead store just a hash of the expected answer and drop the shift - slightly more secure, less flexible. Going with storing the shift for now.)

## Rules to keep it consistent

- Uppercase everything before comparing, so the input's case doesn't matter.
- Only shift A-Z; leave any digits/spaces as-is.
- Wrap around (Z + 1 = A).
- Shift is 1-25 (0 or 26 would do nothing).

## Logic (pseudocode)

```text
caesar(text, shift):
    for each letter in uppercase(text):
        if A-Z: shift it, wrapping at Z
        else: leave it
verify(input, baseCode, shift):
    return uppercase(input) == caesar(baseCode, shift)
```

## Test cases for Sprint 2

| Base | Shift | Correct | Input | Result |
|---|---|---|---|---|
| HEALTH | 3 | KHDOWK | KHDOWK | pass |
| HEALTH | 3 | KHDOWK | khdowk | pass (case) |
| HEALTH | 3 | KHDOWK | HEALTH | fail (no shift) |
| CARE | 5 | HFWJ | HFWJ | pass |
| CARE | 5 | HFWJ | HFWI | fail |

That covers the happy path, case handling, and failures, which is enough for the "successful auth" and "failed login" tests the spec wants.

## Security reality

A shift only has 25 possibilities, so this is weak on its own - it's a third factor on top of the password and security question, not real protection by itself. Don't show the right answer on failure, and consider locking after a few wrong tries.