class Data {
    constructor() {
        this.images = [];
        this.id = null;
        this.dimension = null;
        this.question = null;
        this.qusetion_type_id = null;
        this.options = {};
        this.answers = {};

        this.qusetion_format_map = {
            0: "Yes-No Question",
            1: "Multiple Choice Question",
            2: "Open-Ended Question",
            3: "Localization Question",
            4: "Closed-Form Question",
        };
    }
}
