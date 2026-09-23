AI tools used:
- ChatGPT: Used for understanding the task, discussing project structure,
  debugging, and reviewing implementation ideas.

AI mistakes:
- An early implementation rejected out-of-order events because it expected
  the first received event to be "created". I caught this while testing
  events arriving in a different order and changed the logic.

My work:
- I implemented and tested the backend and frontend.
- I substantially rewrote/simplified suggested code where needed.
- I tested the API manually and wrote the service tests.