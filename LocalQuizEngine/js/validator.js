function validateQuiz(quiz) {

    const messages = [];
    let valid = true;

    function error(message) {
        valid = false;
        messages.push("ERROR: " + message);
    }

    function warning(message) {
        messages.push("WARNING: " + message);
    }

    /*
     * Top Level
     */

    if (typeof quiz !== "object" || quiz === null) {
        error("Root object missing.");
        return { valid, messages };
    }

    if (quiz.formatVersion !== 1) {
        error("formatVersion must equal 1.");
    }

    if (!quiz.metadata) {
        error("metadata section missing.");
    }

    if (!Array.isArray(quiz.questions)) {
        error("questions array missing.");
    }

    /*
     * Metadata
     */

    if (quiz.metadata) {

        if (
            typeof quiz.metadata.title !== "string" ||
            quiz.metadata.title.trim() === ""
        ) {
            error("metadata.title missing or empty.");
        }

        if (
            typeof quiz.metadata.author !== "string" ||
            quiz.metadata.author.trim() === ""
        ) {
            error("metadata.author missing or empty.");
        }

        if (
            typeof quiz.metadata.creationDate !== "string" ||
            quiz.metadata.creationDate.trim() === ""
        ) {
            error("metadata.creationDate missing.");
        }

        if (
            quiz.metadata.description !== undefined &&
            typeof quiz.metadata.description !== "string"
        ) {
            error("metadata.description must be a string.");
        }
    }

    /*
     * Questions
     */

    if (Array.isArray(quiz.questions)) {

        if (quiz.questions.length === 0) {
            error("questions array is empty.");
        }

        quiz.questions.forEach((question, index) => {

            const questionNumber = index + 1;

            if (
                typeof question.question !== "string" ||
                question.question.trim() === ""
            ) {
                error(
                    `Question ${questionNumber}: question text missing.`
                );
            }

            if (
                question.type !== "single" &&
                question.type !== "multiple"
            ) {
                error(
                    `Question ${questionNumber}: invalid type.`
                );
            }

            if (
                !Number.isInteger(question.displayAnswers) ||
                question.displayAnswers < 1
            ) {
                error(
                    `Question ${questionNumber}: invalid displayAnswers value.`
                );
            }

            if (!Array.isArray(question.answers)) {
                error(
                    `Question ${questionNumber}: answers array missing.`
                );
                return;
            }

            let correctCount = 0;

            question.answers.forEach((answer, answerIndex) => {

                if (
                    typeof answer.text !== "string" ||
                    answer.text.trim() === ""
                ) {
                    error(
                        `Question ${questionNumber}, Answer ${answerIndex + 1}: text missing.`
                    );
                }

                if (
                    typeof answer.correct !== "boolean"
                ) {
                    error(
                        `Question ${questionNumber}, Answer ${answerIndex + 1}: correct must be true or false.`
                    );
                }

                if (answer.correct) {
                    correctCount++;
                }
            });

            if (
                question.displayAnswers >
                question.answers.length
            ) {
                error(
                    `Question ${questionNumber}: displayAnswers exceeds total answers.`
                );
            }

            if (
                question.type === "single" &&
                correctCount !== 1
            ) {
                error(
                    `Question ${questionNumber}: single-answer questions require exactly one correct answer.`
                );
            }

            if (
                question.type === "multiple" &&
                correctCount < 1
            ) {
                error(
                    `Question ${questionNumber}: multiple-answer questions require at least one correct answer.`
                );
            }

            if (
                question.type === "multiple" &&
                question.displayAnswers < correctCount
            ) {
                warning(
                    `Question ${questionNumber}: displayAnswers is less than number of correct answers.`
                );
            }
        });
    }

    if (valid) {
        messages.unshift(
            "SUCCESS: Quiz validation passed."
        );
    }

    return {
        valid,
        messages
    };
}