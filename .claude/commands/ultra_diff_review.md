# Ultra Diff Review

> Execute each task in order to conduct a thorough code review

## Task 1: Create diff.txt

Create a comprehensive diff of current changes and save to diff.txt file.

## Task 2: Git diff and append

Then run git diff and append the output to the file.

## Task 3: Multi-LLM analysis

Use multiple language models to analyze the diff:

prompts_from_file_to_file(
from_file = "diff.txt",
models = "openai:gpt-5, anthropic:claude-sonnet-4-20250514, google:gemini-2.0-flash-thinking-exp",
output_dir = "ultra_diff_review/"
)


## Task 4: Read outputs and synthesize

Read the output files and synthesize the results into a comprehensive review called `ultra_diff_review/fusion_ultra_diff_review.md` following the original instructions without any additional instructions or callouts.

## Task 5: Present the results

Present the final synthesized review to the user.
