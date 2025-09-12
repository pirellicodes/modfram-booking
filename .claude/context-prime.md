# Context Prime
## model
claude-3.5
## purpose
Prime the agent to work on dashboard calendar, bookings, availability, charts.
## variables
focus_paths: ["README.md","src/app/(admin)/admin","src/components","src/lib","ai-docs/supabase-schema.md"]
## steps
- run: git ls-files
- read: "{{focus_paths}}"
- summarize: "Map routes, key components, hooks, Supabase clients. List gaps and next_actions."
- output: "JSON { routes[], components[], hooks[], libs[], gaps[], next_actions[] }"
