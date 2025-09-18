# Create the AI agent selection guide
cat > AI_AGENT_GUIDE.md << 'EOF'
# AI Agent Selection Guide

## Planning & Architecture
**Use: ChatGPT o3 or Claude Opus 4**
- System design decisions
- Breaking down complex features into tasks
- Database schema planning
- API architecture design
- Multi-step project roadmaps
- "How should I structure this system?"

## Code Implementation
**Use: Claude Code CLI (Max Plan)**
- Writing actual code
- Component development
- Bug fixes and debugging
- TypeScript/Next.js implementation
- Shadcn UI integration
- "Build me this specific feature"

## Code Review & Analysis
**Use: Claude Code CLI (Max Plan)**
- Large codebase analysis
- Performance optimization suggestions
- Security audit
- Best practices review
- Documentation gaps
- "Review this code and find issues"

## Testing & QA
**Use: Claude Code CLI (Max Plan)**
- Unit test creation
- Integration test planning
- Edge case identification
- Test coverage analysis
- "Write tests for this component"

## Documentation
**Use: Gemini 2.5 Pro**
- Technical documentation
- API documentation
- README files
- Code comments
- User guides
- "Document this API/feature"

## UI/UX & Styling
**Use: Claude Code CLI (Max Plan)**
- Component styling
- Tailwind CSS implementation
- Responsive design
- Accessibility improvements
- "Style this component with Tailwind"

## DevOps & Configuration
**Use: ChatGPT 4o**
- Build scripts
- Deployment configuration
- Environment setup
- CI/CD pipelines
- "Set up my deployment pipeline"

## Quick Debugging
**Use: Claude Code CLI (Max Plan)**
- Error message analysis
- Quick fixes
- Stack trace interpretation
- Console error resolution
- "Why is this throwing an error?"

## Creative Problem Solving
**Use: ChatGPT o3**
- Novel approaches to problems
- Feature ideation
- User experience improvements
- Business logic decisions
- "What's a creative solution to...?"

## File Management & Basic Editing
**Use: Zed Editor**
- File navigation
- Basic text editing
- Find/replace operations
- Git operations
- Terminal commands
- Project organization

## Quick Reference

| Task Type | Best Tool |
|-----------|-----------|
| Planning | ChatGPT o3 / Claude Opus |
| Coding | Claude Code CLI |
| Review | Claude Code CLI |
| Testing | Claude Code CLI |
| Docs | Gemini 2.5 Pro |
| Debugging | Claude Code CLI |
| Creative | ChatGPT o3 |
| File Ops | Zed Editor |

## Cost Strategy
- **Claude Code CLI**: Heavy AI work (covered by Max plan)
- **Zed Agent**: Avoid for AI tasks (expensive API billing)
- **Other LLMs**: Specialized tasks not covered by Claude
