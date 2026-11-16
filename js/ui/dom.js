export function requireElement(id) {
    const element = document.getElementById(id);

    if (element === null) {
        throw new Error(`The element #${id} is missing from the page.`);
    }

    return element;
}

export function makeElement(tag, className = "", text = "") {
    const element = document.createElement(tag);

    element.className = className;
    element.textContent = text;
    return element;
}

export function makeButton(label, action, className = "btn btn--small", data = {}) {
    const button = makeElement("button", className, label);

    button.type = "button";
    button.dataset.action = action;
    Object.entries(data).forEach(([key, value]) => {
        button.dataset[key] = String(value);
    });
    return button;
}

export function fillSelect(select, options, selectedValue = "") {
    const values = options.map((option) => String(option.value));

    select.textContent = "";
    options.forEach(({ value, label }) => {
        const option = document.createElement("option");

        option.value = String(value);
        option.textContent = label;
        select.append(option);
    });

    if (values.length > 0) {
        select.value = values.includes(String(selectedValue)) ? String(selectedValue) : values[0];
    }
}