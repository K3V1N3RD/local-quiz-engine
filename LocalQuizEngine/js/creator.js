const questionEditor =
    document.getElementById("questionEditor");

const addQuestionButton =
    document.getElementById("addQuestionButton");

const exportQuizButton =
    document.getElementById("exportQuizButton");

const creatorTitle =
    document.getElementById("creatorTitle");

const creatorDescription =
    document.getElementById("creatorDescription");

const creatorAuthor =
    document.getElementById("creatorAuthor");

const loadIntoEditorButton =
    document.getElementById("loadIntoEditorButton");

const editQuizFile =
    document.getElementById("editQuizFile");

let creatorQuestions = [];

function addQuestion() {

    const question = {
        question: "",
        type: "single",
        displayAnswers: 4,
        explanation: "",
        answers: [
            {
                text: "",
                correct: false
            }
        ]
    };

    creatorQuestions.push(question);

    renderCreator();
}

function renderCreator() {

    questionEditor.innerHTML = "";

    creatorQuestions.forEach(
        (question, questionIndex) => {

            const container =
                document.createElement("div");

            container.innerHTML = `
                <hr>

                <h3>
                    Question ${questionIndex + 1}
                </h3>

                <p>Question</p>

                <input
                    value="${escapeHtml(question.question)}"
                    data-question="${questionIndex}"
                    data-field="question">

                <p>Type</p>

                <select
                    data-question="${questionIndex}"
                    data-field="type">

                    <option value="single"
                        ${question.type === "single" ? "selected" : ""}>
                        Single
                    </option>

                    <option value="multiple"
                        ${question.type === "multiple" ? "selected" : ""}>
                        Multiple
                    </option>

                </select>

                <p>Display Answers</p>

                <input
                    type="number"
                    min="1"
                    value="${question.displayAnswers}"
                    data-question="${questionIndex}"
                    data-field="displayAnswers">

                <p>Explanation</p>

                <textarea
                    data-question="${questionIndex}"
                    data-field="explanation">${escapeHtml(question.explanation)}</textarea>

                <h4>Answers</h4>

                <div id="answers-${questionIndex}"></div>

                <button
                    class="addAnswer"
                    data-question="${questionIndex}">
                    Add Answer
                </button>

                <button
                    class="deleteQuestion"
                    data-question="${questionIndex}">
                    Delete Question
                </button>
            `;

            questionEditor.appendChild(container);

            const answerContainer =
                container.querySelector(
                    `#answers-${questionIndex}`
                );

            question.answers.forEach(
                (answer, answerIndex) => {

                    const row =
                        document.createElement("div");

                    row.innerHTML = `
                        <input
                            value="${escapeHtml(answer.text)}"
                            data-question="${questionIndex}"
                            data-answer="${answerIndex}"
                            data-answerfield="text">

                        <label>
                            Correct
                            <input
                                type="checkbox"
                                ${answer.correct ? "checked" : ""}
                                data-question="${questionIndex}"
                                data-answer="${answerIndex}"
                                data-answerfield="correct">
                        </label>

                        <button
                            class="deleteAnswer"
                            data-question="${questionIndex}"
                            data-answer="${answerIndex}">
                            Delete
                        </button>
                    `;

                    answerContainer.appendChild(row);
                });
        });

    attachCreatorEvents();
}

function attachCreatorEvents() {

    document
        .querySelectorAll("[data-field]")
        .forEach(element => {

            element.addEventListener(
                "input",
                updateQuestionField
            );

            element.addEventListener(
                "change",
                updateQuestionField
            );
        });

    document
        .querySelectorAll("[data-answerfield]")
        .forEach(element => {

            element.addEventListener(
                "input",
                updateAnswerField
            );

            element.addEventListener(
                "change",
                updateAnswerField
            );
        });

    document
        .querySelectorAll(".addAnswer")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const q =
                        Number(
                            button.dataset.question
                        );

                    creatorQuestions[q]
                        .answers
                        .push({
                            text: "",
                            correct: false
                        });

                    renderCreator();
                });
        });

    document
        .querySelectorAll(".deleteAnswer")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const q =
                        Number(
                            button.dataset.question
                        );

                    const a =
                        Number(
                            button.dataset.answer
                        );

                    creatorQuestions[q]
                        .answers
                        .splice(a, 1);

                    renderCreator();
                });
        });

    document
        .querySelectorAll(".deleteQuestion")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const q =
                        Number(
                            button.dataset.question
                        );

                    creatorQuestions.splice(q, 1);

                    renderCreator();
                });
        });
}

function updateQuestionField(event) {

    const q =
        Number(
            event.target.dataset.question
        );

    const field =
        event.target.dataset.field;

    creatorQuestions[q][field] =
        field === "displayAnswers"
        ? Number(event.target.value)
        : event.target.value;
}

function updateAnswerField(event) {

    const q =
        Number(
            event.target.dataset.question
        );

    const a =
        Number(
            event.target.dataset.answer
        );

    const field =
        event.target.dataset.answerfield;

    creatorQuestions[q]
        .answers[a][field] =
            field === "correct"
            ? event.target.checked
            : event.target.value;
}

function exportQuiz() {

    const quiz = {

    formatVersion: 1,

    metadata: {
        title:
            creatorTitle.value,
        description:
            creatorDescription.value,
        author:
            creatorAuthor.value,
        creationDate:
            new Date()
                .toISOString()
                .split("T")[0]
    },

    generator: {
        application:
            "LocalQuizEngine",
        version:
            "1.0"
    },

    questions:
        creatorQuestions
};

    const text =
        JSON.stringify(
            quiz,
            null,
            2
        );

    const blob =
        new Blob(
            [text],
            {
                type:
                    "application/json"
            }
        );
    var shouldProceed = true;
    validation = validateQuiz(quiz);
    if (!validation.valid){
        shouldProceed = window.confirm(
            validation.messages.concat(
                "Invalid quiz. Select OK to proceed anyways, Cancel to keep editing").join("\n"));
    }
        if (shouldProceed){
            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
            "quiz.json";

            link.click();

            URL.revokeObjectURL(url);
        }
}

async function loadQuizIntoEditor() {

    const file =
        editQuizFile.files[0];

    if (!file) {

        alert(
            "Select a quiz file."
        );

        return;
    }

    try {

        const text =
            await file.text();

        const quiz =
            JSON.parse(text);

        const validation =
            validateQuiz(quiz);

        if (!validation.valid) {

            alert(
                validation.messages.join("\n")
            );

        }

        creatorTitle.value =
            quiz.metadata.title || "";

        creatorDescription.value =
            quiz.metadata.description || "";

        creatorAuthor.value =
            quiz.metadata.author || "";

        creatorQuestions =
            structuredClone(
                quiz.questions
            );

        document
            .getElementById("editScreen")
            .hidden = true;

        document
            .getElementById("creatorScreen")
            .hidden = false;

        renderCreator();

    } catch (error) {

        alert(
            "Unable to load quiz.\n\n" +
            error.message
        );
    }
}

function escapeHtml(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

addQuestionButton.addEventListener(
    "click",
    addQuestion
);

exportQuizButton.addEventListener(
    "click",
    exportQuiz
);

if (loadIntoEditorButton) {

    loadIntoEditorButton.addEventListener(
        "click",
        loadQuizIntoEditor
    );
}

addQuestion();
renderCreator();
