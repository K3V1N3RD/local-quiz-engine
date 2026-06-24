const mainMenu =
    document.getElementById("mainMenu");

const loadQuizMenuButton =
    document.getElementById("loadQuizMenuButton");

const createQuizMenuButton =
    document.getElementById("createQuizMenuButton");

const editQuizMenuButton =
    document.getElementById("editQuizMenuButton");

const aboutMenuButton =
    document.getElementById("aboutMenuButton");

const loadScreen =
    document.getElementById("loadScreen");

const editScreen =
    document.getElementById("editScreen");

const creatorScreen =
    document.getElementById("creatorScreen");

const aboutScreen =
    document.getElementById("aboutScreen");

const quizScreen =
    document.getElementById("quizScreen");

const resultsScreen =
    document.getElementById("resultsScreen");

const fileInput =
    document.getElementById("quizFile");

const loadButton =
    document.getElementById("loadButton");

const quizTitle =
    document.getElementById("quizTitle");

const questionNumber =
    document.getElementById("questionNumber");

const questionTotal =
    document.getElementById("questionTotal");

const questionText =
    document.getElementById("questionText");

const answersDiv =
    document.getElementById("answers");

const previousButton =
    document.getElementById("previousButton");

const nextButton =
    document.getElementById("nextButton");

const submitButton =
    document.getElementById("submitButton");

const scoreElement =
    document.getElementById("score");

const reviewElement =
    document.getElementById("review");

const headerImage =
    document.getElementById("headerImage");

let quizData = null;
let quizQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];

/*
 * Main Menu
 */

loadQuizMenuButton.addEventListener(
    "click",
    () => {

        mainMenu.hidden = true;
        loadScreen.hidden = false;
    }
);

createQuizMenuButton.addEventListener(
    "click",
    () => {

        mainMenu.hidden = true;
        creatorScreen.hidden = false;
    }
);

editQuizMenuButton.addEventListener(
    "click",
    () => {

        mainMenu.hidden = true;
        editScreen.hidden = false;
    }
);

aboutMenuButton.addEventListener(
    "click",
    () => {

        mainMenu.hidden = true;
        aboutScreen.hidden = false;
    }
);

/*
 * Back Buttons
 */

document
    .getElementById(
        "backToMenuFromLoad"
    )
    .addEventListener(
        "click",
        () => {

            loadScreen.hidden = true;
            mainMenu.hidden = false;
        }
    );

document
    .getElementById(
        "backToMenuFromEdit"
    )
    .addEventListener(
        "click",
        () => {

            editScreen.hidden = true;
            mainMenu.hidden = false;
        }
    );

document
    .getElementById(
        "backToMenuFromCreator"
    )
    .addEventListener(
        "click",
        () => {

            creatorScreen.hidden = true;
            mainMenu.hidden = false;
        }
    );

document
    .getElementById(
        "backToMenuFromAbout"
    )
    .addEventListener(
        "click",
        () => {

            aboutScreen.hidden = true;
            mainMenu.hidden = false;
        }
    );

/*
 * Load Quiz
 */

loadButton.addEventListener(
    "click",
    async () => {

        const file =
            fileInput.files[0];

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

                return;
            }

            startQuiz(quiz);

        } catch (error) {

            alert(
                "Failed to load quiz.\n\n" +
                error.message
            );
        }
    }
);

/*
 * Quiz Start
 */

function startQuiz(quiz) {

    quizData = quiz;

    quizQuestions =
        structuredClone(
            quiz.questions
        );

    shuffleArray(
        quizQuestions
    );

    userAnswers =
        new Array(
            quizQuestions.length
        ).fill(null);

    currentQuestionIndex = 0;

    headerImage.src =
        "logo.png";

    loadScreen.hidden = true;
    quizScreen.hidden = false;

    quizTitle.textContent =
        quiz.metadata.title;

    renderQuestion();
}

/*
 * Render Question
 */

function renderQuestion() {

    const question =
        quizQuestions[
            currentQuestionIndex
        ];

    questionNumber.textContent =
        currentQuestionIndex + 1;

    questionTotal.textContent =
        quizQuestions.length;

    questionText.textContent =
        question.question;

    answersDiv.innerHTML = "";

    if (
        !question.displayedAnswers
    ) {

        question.displayedAnswers =
            buildAnswerList(
                question
            );
    }

    const answers =
        question.displayedAnswers;

    const savedAnswer =
        userAnswers[
            currentQuestionIndex
        ];

    answers.forEach(
        (answer, index) => {

            const label =
                document.createElement(
                    "label"
                );

            const input =
                document.createElement(
                    "input"
                );

            input.type =
                question.type === "single"
                ? "radio"
                : "checkbox";

            input.name =
                "question";

            input.value =
                index;

            if (
                savedAnswer &&
                savedAnswer.includes(index)
            ) {
                input.checked = true;
            }

            input.addEventListener(
                "change",
                saveCurrentAnswer
            );

            label.appendChild(
                input
            );

            label.append(
                " " +
                answer.text
            );

            answersDiv.appendChild(
                label
            );

            answersDiv.appendChild(
                document.createElement(
                    "br"
                )
            );
        }
    );
}

/*
 * Save Answer
 */

function saveCurrentAnswer() {

    const selected =
        [
            ...answersDiv.querySelectorAll(
                "input"
            )
        ]
        .filter(
            input =>
                input.checked
        )
        .map(
            input =>
                Number(
                    input.value
                )
        );

    userAnswers[
        currentQuestionIndex
    ] = selected;
}

/*
 * Navigation
 */

previousButton.addEventListener(
    "click",
    () => {

        saveCurrentAnswer();

        if (
            currentQuestionIndex > 0
        ) {

            currentQuestionIndex--;

            renderQuestion();
        }
    }
);

nextButton.addEventListener(
    "click",
    () => {

        saveCurrentAnswer();

        if (
            currentQuestionIndex <
            quizQuestions.length - 1
        ) {

            currentQuestionIndex++;

            renderQuestion();
        }
    }
);

/*
 * Submit
 */

submitButton.addEventListener(
    "click",
    () => {

        saveCurrentAnswer();

        const confirmed =
            confirm(
                "Submit quiz for grading?"
            );

        if (!confirmed) {
            return;
        }

        showResults();
    }
);

/*
 * Results
 */

function showResults() {

    let score = 0;

    reviewElement.innerHTML =
        "";

    quizQuestions.forEach(
        (
            question,
            questionIndex
        ) => {

            const selected =
                userAnswers[
                    questionIndex
                ] || [];

            const correct =
                question.displayedAnswers
                    .map(
                        (
                            answer,
                            index
                        ) =>
                            answer.correct
                                ? index
                                : null
                    )
                    .filter(
                        value =>
                            value !== null
                    );

            const isCorrect =
                arraysEqual(
                    [...selected].sort(),
                    [...correct].sort()
                );

            if (
                isCorrect
            ) {

                score++;

                return;
            }

            const section =
                document.createElement(
                    "div"
                );

            const chosen =
                selected.map(
                    index =>
                        question
                            .displayedAnswers[index]
                            .text
                );

            const answers =
                question
                    .displayedAnswers
                    .filter(
                        answer =>
                            answer.correct
                    )
                    .map(
                        answer =>
                            answer.text
                    );

            section.innerHTML =
                `
                <hr>
                <p><strong>Question:</strong> ${question.question}</p>
                <p><strong>Your Answer:</strong> ${chosen.join(", ") || "(none)"}</p>
                <p><strong>Correct Answer:</strong> ${answers.join(", ")}</p>
                <p><strong>Explanation:</strong> ${question.explanation || "(none)"}</p>
                `;

            reviewElement.appendChild(
                section
            );
        }
    );

    if (
        score ===
        quizQuestions.length
    ) {

        headerImage.src =
            "trophy.png";

    } else {

        headerImage.src =
            "logo.png";
    }

    quizScreen.hidden = true;
    resultsScreen.hidden = false;

    const percentage =
        (
            score /
            quizQuestions.length
        ) * 100;

    scoreElement.textContent =
        `${score} / ${quizQuestions.length} (${percentage.toFixed(1)}%)`;
}

/*
 * Answer Selection
 */

function buildAnswerList(
    question
) {

    const correct =
        question.answers.filter(
            answer =>
                answer.correct
        );

    const incorrect =
        question.answers.filter(
            answer =>
                !answer.correct
        );

    shuffleArray(
        incorrect
    );

    const needed =
        Math.max(
            0,
            question.displayAnswers -
            correct.length
        );

    const selectedWrong =
        incorrect.slice(
            0,
            needed
        );

    const result = [
        ...correct,
        ...selectedWrong
    ];

    shuffleArray(
        result
    );

    return result;
}

/*
 * Utility
 */

function shuffleArray(
    array
) {

    for (
        let i =
            array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );

        [
            array[i],
            array[j]
        ] = [
            array[j],
            array[i]
        ];
    }
}

function arraysEqual(
    a,
    b
) {

    if (
        a.length !==
        b.length
    ) {
        return false;
    }

    return a.every(
        (
            value,
            index
        ) =>
            value ===
            b[index]
    );
}