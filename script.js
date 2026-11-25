"use strict";

const STORAGE_KEY = "careerbuild.progress.v1";
const roadmapData = {
    fullstack: {
        title: "Full Stack Developer",
        steps: [
            ["HTML foundations", "Structure accessible, semantic web pages."],
            ["CSS & responsive design", "Create layouts that work on every screen."],
            ["JavaScript essentials", "Practice logic, the DOM, and browser APIs."],
            ["Frontend framework", "Build reusable interfaces with React or a similar tool."],
            ["Backend & databases", "Learn APIs, server basics, and how data is stored."],
            ["Build and ship projects", "Create a portfolio project and publish it."]
        ]
    },
    ai: {
        title: "AI / ML Engineer",
        steps: [
            ["Python programming", "Get comfortable with functions, data structures, and testing."],
            ["Math & statistics", "Build intuition for probability, vectors, and common statistics."],
            ["Data handling", "Clean and explore datasets with Python tools."],
            ["Machine learning basics", "Understand model training, evaluation, and overfitting."],
            ["Neural networks", "Explore deep learning concepts and a framework."],
            ["Build an ML project", "Document a small end-to-end experiment."]
        ]
    },
    data: {
        title: "Data Scientist",
        steps: [
            ["Python for data", "Practice Python fundamentals and notebooks."],
            ["SQL foundations", "Query, filter, and join relational data."],
            ["Statistics & probability", "Learn distributions, sampling, and inference."],
            ["Data visualization", "Communicate findings with clear charts."],
            ["Machine learning basics", "Train and evaluate introductory models."],
            ["Portfolio analysis", "Publish a reproducible project with your conclusions."]
        ]
    },
    security: {
        title: "Cybersecurity Engineer",
        steps: [
            ["Networking fundamentals", "Understand protocols, addressing, and common services."],
            ["Linux & command line", "Practice navigating and managing a Linux environment."],
            ["Programming basics", "Use Python or scripting to automate safe tasks."],
            ["Security foundations", "Learn threat modeling and core defensive principles."],
            ["Monitoring & response", "Explore logs, alerts, and incident response concepts."],
            ["Practice in a safe lab", "Use authorized training labs and document what you learn."]
        ]
    }
};

const careers = {
    ai: {
        title: "AI / ML Engineer",
        tag: "BUILD THE FUTURE",
        description: "AI and machine learning engineers build systems that learn from data. They work with software, statistics, and real-world problem solving to create useful, testable models.",
        skills: ["Python", "Statistics", "Linear algebra", "Machine learning", "Data preparation"],
        path: ["Learn Python and build strong programming habits.", "Study foundational statistics and linear algebra.", "Practice preparing data and evaluating simple models.", "Create a small, well-documented project and explain its limitations."]
    },
    fullstack: {
        title: "Full Stack Developer",
        tag: "MAKE IDEAS REAL",
        description: "Full stack developers create both the user-facing parts of products and the server-side systems that support them. The work blends interface craft with practical problem solving.",
        skills: ["HTML & CSS", "JavaScript", "Frontend frameworks", "APIs", "Databases"],
        path: ["Build accessible pages with HTML and responsive CSS.", "Learn JavaScript and browser fundamentals.", "Create interactive projects with a frontend framework.", "Add an API and database, then deploy a portfolio project."]
    },
    data: {
        title: "Data Scientist",
        tag: "FIND THE SIGNAL",
        description: "Data scientists explore datasets, use statistical and computational methods, and communicate insights that help teams make informed decisions.",
        skills: ["Python", "SQL", "Statistics", "Data visualization", "Critical thinking"],
        path: ["Learn Python and SQL to work with data.", "Practice statistics and ask clear, testable questions.", "Visualize findings and explain uncertainty.", "Publish a reproducible analysis with clear conclusions."]
    },
    security: {
        title: "Cybersecurity Engineer",
        tag: "PROTECT WHAT MATTERS",
        description: "Cybersecurity engineers help organizations reduce risk and protect systems. Their work can include defensive tooling, secure design, monitoring, and incident response.",
        skills: ["Networking", "Linux", "Scripting", "Security fundamentals", "Clear documentation"],
        path: ["Learn networking concepts and operating-system basics.", "Practice Linux and scripting in your own environment.", "Study security principles and defensive monitoring.", "Use authorized training labs and document safe, defensive projects."]
    }
};

const questions = [
    { question: "Which technology describes the structure and meaning of a web page?", options: ["HTML", "SQL", "Git"], answer: "HTML", topic: "HTML foundations" },
    { question: "Which language is commonly used to add interactivity in a web browser?", options: ["JavaScript", "CSS", "Markdown"], answer: "JavaScript", topic: "JavaScript fundamentals" },
    { question: "What does CSS primarily control?", options: ["Page presentation and layout", "Database queries", "Server hardware"], answer: "Page presentation and layout", topic: "CSS and responsive design" },
    { question: "Which data format is commonly used when a web API returns structured data?", options: ["JSON", "JPEG", "MP3"], answer: "JSON", topic: "APIs and data" },
    { question: "What is the main purpose of version control such as Git?", options: ["Track changes to files over time", "Style a web page", "Host a database"], answer: "Track changes to files over time", topic: "Git and collaboration" }
];

const defaultState = {
    profileName: "",
    roadmap: "fullstack",
    completed: {},
    quiz: null,
    resume: null
};
let state = loadState();
let quizIndex = 0;
let quizScore = 0;
let quizMissed = [];
let toastTimer;

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return { ...defaultState, completed: {} };
        const parsed = JSON.parse(saved);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Saved progress has an unexpected format.");
        return {
            ...defaultState,
            ...parsed,
            completed: parsed.completed && typeof parsed.completed === "object" && !Array.isArray(parsed.completed) ? parsed.completed : {}
        };
    } catch (error) {
        console.error("Could not load CareerBuild progress.", error);
        return { ...defaultState, completed: {} };
    }
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        return true;
    } catch (error) {
        console.error("Could not save CareerBuild progress.", error);
        showToast("Progress could not be saved in this browser.");
        return false;
    }
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[character]);
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2800);
}

function updateProfile(name) {
    const cleanName = name.trim();
    const displayName = cleanName || "Your profile";
    const initial = cleanName ? cleanName.charAt(0).toUpperCase() : "S";
    document.getElementById("sidebar-name").textContent = displayName;
    document.getElementById("sidebar-avatar").textContent = initial;
    document.getElementById("top-avatar").textContent = initial;
}

function roadmapKey(id) {
    return `${id}-${state.roadmap}`;
}

function renderRoadmap() {
    const roadmap = roadmapData[state.roadmap] || roadmapData.fullstack;
    const list = document.getElementById("roadmap-list");
    document.getElementById("roadmap-title").textContent = roadmap.title;
    document.getElementById("roadmap-select").value = state.roadmap;
    list.innerHTML = roadmap.steps.map((step, index) => {
        const complete = Boolean(state.completed[roadmapKey(index)]);
        return `<label class="roadmap-step${complete ? " completed" : ""}">
            <span class="step-number">${String(index + 1).padStart(2, "0")}</span>
            <span class="step-copy"><strong>${escapeHTML(step[0])}</strong><small>${escapeHTML(step[1])}</small></span>
            <input class="step-checkbox" type="checkbox" data-step="${index}" aria-label="Mark ${escapeHTML(step[0])} completed"${complete ? " checked" : ""}>
        </label>`;
    }).join("");
    updateProgress();
}

function updateProgress() {
    const roadmap = roadmapData[state.roadmap] || roadmapData.fullstack;
    const completeCount = roadmap.steps.reduce((total, _, index) => total + (state.completed[roadmapKey(index)] ? 1 : 0), 0);
    const percent = Math.round((completeCount / roadmap.steps.length) * 100);
    document.getElementById("roadmap-progress-label").textContent = `${completeCount} of ${roadmap.steps.length} steps complete`;
    document.getElementById("roadmap-percent").textContent = `${percent}%`;
    document.getElementById("roadmap-progress-bar").style.width = `${percent}%`;
    document.getElementById("overall-progress").textContent = percent;
    document.getElementById("overall-progress-bar").style.width = `${percent}%`;
    document.getElementById("skills-count").textContent = String(completeCount).padStart(2, "0");
}

function renderQuizQuestion() {
    const area = document.getElementById("quiz-area");
    if (quizIndex >= questions.length) {
        const missedTopics = [...new Set(quizMissed)];
        const guidance = missedTopics.length
            ? `A few topics to revisit: ${missedTopics.map(escapeHTML).join(", ")}.`
            : "Great work. Try a more advanced project to keep building your skills.";
        area.innerHTML = `<div class="quiz-result"><div class="result-mark">✦</div><h3>Assessment complete</h3><p>You got <strong>${quizScore} out of ${questions.length}</strong> correct. ${guidance}</p><button class="button button-primary" id="retry-quiz" type="button">Try again <span>↻</span></button></div>`;
        state.quiz = { score: quizScore, total: questions.length, completedAt: new Date().toISOString() };
        saveState();
        return;
    }
    const current = questions[quizIndex];
    area.innerHTML = `<div class="quiz-topline"><span>QUESTION ${quizIndex + 1} OF ${questions.length}</span><strong>${Math.round((quizIndex / questions.length) * 100)}% COMPLETE</strong></div>
        <h3 class="quiz-question">${escapeHTML(current.question)}</h3>
        <div class="quiz-options">${current.options.map((option, index) => `<button class="quiz-option" type="button" data-option="${index}">${escapeHTML(option)}</button>`).join("")}</div>
        <p class="quiz-feedback" id="quiz-feedback" aria-live="polite"></p>`;
}

function startQuiz() {
    quizIndex = 0;
    quizScore = 0;
    quizMissed = [];
    renderQuizQuestion();
}

function showCareerDetails(careerKey) {
    const career = careers[careerKey];
    if (!career) return;
    const detail = document.getElementById("career-detail");
    detail.innerHTML = `<span class="dialog-tag">${escapeHTML(career.tag)}</span>
        <h2 id="dialog-title">${escapeHTML(career.title)}</h2>
        <p>${escapeHTML(career.description)}</p>
        <h3>Skills to explore</h3><div class="detail-skills">${career.skills.map((skill) => `<span>${escapeHTML(skill)}</span>`).join("")}</div>
        <h3>A possible learning path</h3><ol class="detail-path">${career.path.map((step) => `<li>${escapeHTML(step)}</li>`).join("")}</ol>
        <button class="button button-primary dialog-action" type="button" data-choose-roadmap="${escapeHTML(careerKey)}">View this learning roadmap <span>↗</span></button>`;
    document.getElementById("career-dialog").showModal();
}

function readResumeForm() {
    return {
        name: document.getElementById("studentName").value.trim(),
        role: document.getElementById("studentRole").value.trim(),
        email: document.getElementById("studentEmail").value.trim(),
        phone: document.getElementById("studentPhone").value.trim(),
        education: document.getElementById("studentEducation").value.trim(),
        skills: document.getElementById("studentSkills").value.trim(),
        projects: document.getElementById("studentProjects").value.trim()
    };
}

function renderResume(resume) {
    const contact = [resume.email, resume.phone].filter(Boolean).map(escapeHTML).join(" · ");
    document.getElementById("resume-output").innerHTML = `<article class="resume-document">
        <header><h2>${escapeHTML(resume.name)}</h2><p class="resume-role">${escapeHTML(resume.role)}</p><div class="resume-contact">${contact}</div></header>
        <section><h3>Education</h3><p>${escapeHTML(resume.education)}</p></section>
        <section><h3>Skills</h3><p>${escapeHTML(resume.skills)}</p></section>
        <section><h3>Projects</h3><p>${escapeHTML(resume.projects)}</p></section>
    </article>`;
    document.getElementById("download-resume").disabled = false;
}

function restoreResume() {
    if (!state.resume || typeof state.resume !== "object") return;
    const fields = {
        studentName: "name", studentRole: "role", studentEmail: "email", studentPhone: "phone",
        studentEducation: "education", studentSkills: "skills", studentProjects: "projects"
    };
    for (const [elementId, property] of Object.entries(fields)) {
        const value = state.resume[property];
        if (typeof value === "string") document.getElementById(elementId).value = value;
    }
    if (state.resume.name && state.resume.role && state.resume.email && state.resume.education && state.resume.skills && state.resume.projects) {
        renderResume(state.resume);
        document.getElementById("resume-message").textContent = "Your saved resume is ready to preview.";
    }
}

function appendChatNote(text) {
    const messages = document.getElementById("chat-messages");
    const note = document.createElement("div");
    note.className = "chat-message user-message";
    const avatar = document.createElement("span");
    avatar.className = "message-avatar";
    avatar.textContent = "You";
    const content = document.createElement("div");
    const sender = document.createElement("span");
    sender.className = "message-sender";
    sender.textContent = "YOUR NOTE";
    const body = document.createElement("p");
    body.textContent = text;
    content.append(sender, body);
    note.append(avatar, content);
    messages.append(note);
    messages.scrollTop = messages.scrollHeight;
}

function initNavigation() {
    const sidebar = document.getElementById("sidebar");
    const menuToggle = document.getElementById("menu-toggle");
    menuToggle.addEventListener("click", () => {
        const open = sidebar.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(open));
    });
    document.getElementById("sidebar-close").addEventListener("click", () => {
        sidebar.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.focus();
    });
    document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
            sidebar.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                document.querySelectorAll(".nav-link").forEach((link) => {
                    link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
                });
            });
        }, { rootMargin: "-25% 0px -65% 0px" });
        document.querySelectorAll("main section[id]").forEach((section) => observer.observe(section));
    }
}

function init() {
    document.getElementById("today-label").textContent = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date());
    updateProfile(state.profileName || "");
    renderRoadmap();
    restoreResume();
    initNavigation();

    document.getElementById("roadmap-select").addEventListener("change", (event) => {
        state.roadmap = event.target.value;
        saveState();
        renderRoadmap();
    });
    document.getElementById("roadmap-list").addEventListener("change", (event) => {
        const checkbox = event.target.closest("[data-step]");
        if (!checkbox) return;
        state.completed[roadmapKey(checkbox.dataset.step)] = checkbox.checked;
        saveState();
        renderRoadmap();
        showToast(checkbox.checked ? "Roadmap progress saved." : "Step marked as in progress.");
    });

    document.getElementById("start-quiz").addEventListener("click", startQuiz);
    document.getElementById("quiz-area").addEventListener("click", (event) => {
        if (event.target.closest("#retry-quiz")) {
            startQuiz();
            return;
        }
        const optionButton = event.target.closest("[data-option]");
        if (!optionButton || optionButton.disabled || quizIndex >= questions.length) return;
        const question = questions[quizIndex];
        const chosen = question.options[Number(optionButton.dataset.option)];
        const correct = chosen === question.answer;
        const optionButtons = [...document.querySelectorAll(".quiz-option")];
        optionButtons.forEach((button) => {
            button.disabled = true;
            const option = question.options[Number(button.dataset.option)];
            if (option === question.answer) button.classList.add("correct");
            if (button === optionButton && !correct) button.classList.add("incorrect");
        });
        if (correct) quizScore += 1;
        else quizMissed.push(question.topic);
        document.getElementById("quiz-feedback").textContent = correct ? "That's right — nice work." : `Not quite. The answer is ${question.answer}.`;
        const next = document.createElement("button");
        next.type = "button";
        next.className = "button button-primary quiz-next";
        next.textContent = quizIndex === questions.length - 1 ? "See your results →" : "Next question →";
        next.addEventListener("click", () => {
            quizIndex += 1;
            renderQuizQuestion();
        });
        document.getElementById("quiz-area").append(next);
    });

    document.querySelectorAll(".career-details").forEach((button) => {
        button.addEventListener("click", () => showCareerDetails(button.dataset.career));
    });
    document.getElementById("dialog-close").addEventListener("click", () => document.getElementById("career-dialog").close());
    document.getElementById("career-dialog").addEventListener("click", (event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
        const chooseButton = event.target.closest("[data-choose-roadmap]");
        if (!chooseButton) return;
        state.roadmap = chooseButton.dataset.chooseRoadmap;
        saveState();
        renderRoadmap();
        document.getElementById("career-dialog").close();
        document.getElementById("roadmap").scrollIntoView({ behavior: "smooth" });
    });

    const resumeForm = document.getElementById("resume-form");
    resumeForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const message = document.getElementById("resume-message");
        if (!resumeForm.reportValidity()) {
            message.textContent = "Please complete the required fields with valid information.";
            message.className = "form-hint error";
            return;
        }
        const resume = readResumeForm();
        if (Object.values(resume).some((value) => typeof value !== "string")) {
            message.textContent = "Please check your details and try again.";
            message.className = "form-hint error";
            return;
        }
        state.resume = resume;
        state.profileName = resume.name;
        saveState();
        updateProfile(resume.name);
        renderResume(resume);
        message.textContent = "Resume preview updated. Your details are saved in this browser.";
        message.className = "form-hint success";
    });
    document.getElementById("clear-resume").addEventListener("click", () => {
        resumeForm.reset();
        state.resume = null;
        state.profileName = "";
        saveState();
        updateProfile("");
        document.getElementById("resume-output").innerHTML = `<div class="empty-resume"><span>▧</span><strong>Your resume will take shape here.</strong><p>Fill in the details to preview it. Use “Print / Save PDF” to download a copy.</p></div>`;
        document.getElementById("download-resume").disabled = true;
        const message = document.getElementById("resume-message");
        message.textContent = "Form cleared. Your information stays in this browser and is not sent to a server.";
        message.className = "form-hint";
    });
    document.getElementById("download-resume").addEventListener("click", () => {
        if (!state.resume) {
            showToast("Generate your resume preview before printing.");
            return;
        }
        document.body.classList.add("printing-resume");
        window.print();
        window.setTimeout(() => document.body.classList.remove("printing-resume"), 500);
    });

    document.querySelectorAll(".prompt-chip").forEach((button) => {
        button.addEventListener("click", () => {
            const input = document.getElementById("chat-input");
            input.value = button.textContent.trim();
            input.focus();
        });
    });
    document.getElementById("chat-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const input = document.getElementById("chat-input");
        const note = input.value.trim();
        if (!note) {
            input.focus();
            return;
        }
        appendChatNote(note);
        input.value = "";
        showToast("Note added. An AI response isn't available in this frontend demo.");
    });
}

document.addEventListener("DOMContentLoaded", init);
