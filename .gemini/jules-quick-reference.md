# Jules Handoff: Quick Reference

> Quick 1-page reference for sending work to Jules via the Bridge

## 🚀 How to Send to Jules

1. **Click 🚀 in status bar** (or `Cmd+Shift+P` → "Jules Bridge: Send to Jules")
2. **Select conversation** context (or skip)
3. **Review/edit prompt** (use template if complex)
4. **Click OK**
5. **Get session link** and track progress

---

## ✅ Pre-Flight Checklist

Before clicking 🚀, ensure:

- [ ] **Git repo is clean** (or you're okay with auto-WIP commit)
- [ ] **Task is well-defined** (Jules knows WHAT to do)
- [ ] **Success criteria clear** (Jules knows WHEN it's done)
- [ ] **Constraints documented** (Jules knows what NOT to change)
- [ ] **Context is sufficient** (Jules has the WHY)

---

## 📝 Prompt Structure (30-Second Version)

```markdown
## Objective
[One clear sentence]

## Current Problem
[What's broken or missing]

## Solution Requirements
1. [Specific change 1]
2. [Specific change 2]
3. [Specific change 3]

## Success Test
```bash
[Command that proves it works]
```
Expected: [result]
```

---

## 🎯 Good vs Bad Prompts

### ❌ Too Vague
```
Fix the API
```

### ✅ Clear & Actionable
```
Fix Gemini API 401 error in src/index.ts callGemini():
- Research correct auth method for generativelanguage.googleapis.com
- Update function with working implementation
- Test: curl should return 200 with valid response
```

---

## 🔧 When Jules Gets Stuck

**If Jules:**
- ❌ Misunderstands the task → Add comment in Jules session with clarification
- ❌ Makes wrong assumption → Leave feedback, hand back to Antigravity
- ❌ Can't find docs → Provide direct links in a comment
- ❌ Creates bad PR → Reject, try again with better prompt

**Pro tip:** You can comment directly on the Jules session to guide it!

---

## 📊 Typical Timeline

| Task Complexity | Jules Time | Your Action |
|----------------|------------|-------------|
| Simple fix (1-2 files) | 5-10 min | Quick review & merge |
| Medium feature (3-5 files) | 15-25 min | Thorough review |
| Complex feature (6+ files) | 30-60 min | Detailed review + testing |

---

## 🔄 What to Do While Waiting

1. **Continue other work** - Jules runs async
2. **Check progress** periodically via session link
3. **Prepare to review** - Think about test cases
4. **Work with Antigravity** on other features

---

## 💬 Providing Feedback to Jules

**In the Jules session:**
- ✅ "Good approach, but also handle the error case when..."
- ✅ "This looks right, please also add a test for..."
- ✅ "Almost there! The endpoint should be v1, not v1beta"

---

## 🎓 Quick Tips

1. **Detailed prompts = Better results**
2. **Reference working code** when possible
3. **Specify what NOT to change**
4. **Include test commands**
5. **Set clear success criteria**

---

## 📚 Full Resources

- **Detailed Template:** `.gemini/jules-prompt-template.md`
- **Guidelines:** `.gemini/antigravity-jules-guidelines.md`
- **Jules Dashboard:** https://jules.google.com/

---

**Created:** 2024-11-22  
**For:** Smooth Antigravity ↔ Jules workflows 🚀
