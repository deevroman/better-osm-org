const htmlPropertyNames = ["innerHTML", "outerHTML"]

const htmlPropertyAssignmentSelectors = htmlPropertyNames.flatMap(propertyName => [
    `AssignmentExpression[left.type="MemberExpression"][left.property.type="Identifier"][left.property.name="${propertyName}"]`,
    `AssignmentExpression[left.type="MemberExpression"][left.computed=true][left.property.type="Literal"][left.property.value="${propertyName}"]`,
])

export default [
    {
        rules: {
            "no-restricted-syntax": [
                "error",
                ...htmlPropertyAssignmentSelectors.map(selector => ({
                    selector,
                    message: "Direct innerHTML/outerHTML assignments are forbidden",
                })),
            ],
        },
    },
]
