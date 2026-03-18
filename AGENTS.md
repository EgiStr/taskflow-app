# 🤖 Project Instructions for AI Agents 

You are an AI coding assistant operating in a Next.js App Router full-stack codebase.
CRITICAL: READ AND STRICTLY FOLLOW THESE RULES BEFORE WRITING OR MODIFYING ANY CODE.

<rules>

  <rule id="NEXTJS_VERSIONING" priority="high">
    ## 1. Next.js Breaking Changes
    This project uses modern Next.js features which may include breaking changes from your standard training data.
    - APIs, App Router conventions, caching, and file structures may differ.
    - **MANDATORY**: Before writing complex new implementations, read the relevant guide in `node_modules/next/dist/docs/`.
    - Strictly observe and resolve any Next.js deprecation notices.
  </rule>

  <rule id="LANGUAGE_POLICY" priority="critical">
    ## 2. Strict Bilingual Language Requirements
    You must separate writing languages strictly based on the target audience (End-User vs Developer context).
    
    ### 2a. Client-Facing UI -> 🇮🇩 BAHASA INDONESIA
    Always use grammatically correct, professional Bahasa Indonesia for ANY text displayed to the user in the browser.
    - Includes: UI labels, button texts, toast notifications, error/success messages, tooltips.
    - Includes: Landing pages, Admin dashboards, tracking pages.
    - **NEVER** use English for user-facing copy unless it is a universally accepted brand/technical term.

    ### 2b. Technical Implementation -> 🇬🇧 ENGLISH
    ALWAYS use standard programming conventions in English for all technical and underlying code structures.
    - Includes: Variable names, function names, class names, file/directory names, component names.
    - Includes: Database schema (Prisma), model names, relation names, and database fields.
    - Includes: Code comments, inline explanations, and docstrings.
    - Includes: Commit messages, Pull Request descriptions, and AI artifact summaries.
  </rule>

  <rule id="UI_UX_DESIGN" priority="medium">
    ## 3. UI/UX Design System
    - The design aesthetic follows a modern, clean, and developer-focused UI (inspired by Supabase).
    - **DO NOT** use gradients or overly flashy visuals unless explicitly requested by the user. Maintain a clean, calm, and highly elegant UI.
    - Focus heavily on minimalist borders, robust dark modes, stark light modes, and solid semantic accent colors.
  </rule>

</rules>

**Agent Directive:** 
When generating responses, immediately apply these `<rules>` implicitly. Do not explain that you are following them; simply output code that perfectly adheres to them.
