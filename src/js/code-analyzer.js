import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{loc:true});
};

export {parseCode};

let statements = [];

function create_objects(parseCode) {
    if (parseCode.type.valueOf() === 'Program') {
        program_handle(parseCode);
    }
}
export {create_objects};

function program_handle(program) {
    for (let i=0; i<program.body.length ;++i) {
        switch (program.body[i].type) {
        case 'FunctionDeclaration':
            function_handle(program.body[i]);
            break;
        }
    }
}

function function_handle(func) {
    statements.push({line: func.loc.start.line, type: func.type, name: func.id.name, condition: undefined, value: undefined});
    for (let i =0; i<func.params.length;++i) {
        statements.push({line: func.params[i].loc.start.line, type: func.params[i].type, name: func.params[i].name, condition: undefined, value: undefined});
    }
    body_iter(func.body);
    // for (let i =0; i<func.body.length;++i) {
    //     switch (func.body[i].type) {
    //     case 'BlockStatement':
    //         block_statement_handle();
    //         break;
    //     }
    // }
}

function block_statement_handle(block) {
    for (let obj in block.body) {
        switch (obj.type) {
        case 'VariableDeclaration':
            variable_handle(obj);
            break;
        case 'ExpressionStatement':
            expression_handle(obj);
            break;
        case 'WhileStatement':
            while_handle();
            break;
        }
    }
}


function variable_handle(obj) {
    for (let i=0; i<obj.declarations.length; ++i) {
        statements.push({line: obj.loc.start, type: obj.type, name: obj.id.name, condition: undefined, value: undefined});
    }
}

function expression_handle(obj){
    switch (obj.expression.type) {
    case 'AssignmentExpression':
        assignment_handle();
        break;
    case 'UnaryExpression':

        break;
    case '':

    }
}

function assignment_handle(exp){
    statements.push({line: exp.loc.start, type: exp.type, name: exp.left.name, condition: undefined, value: exp.right.value});

}
function while_handle(exp) {
    let left,right;
    if(exp.left.hasOwnProperty('object'))
        left = array_handle(exp.left.object);
    else
        left = left.name;
    if(exp.right.hasOwnProperty('object')){
        right = array_handle(exp.left.object);
    }

    let condition = left + exp.test.operator+ right;//exp.test.left.name + exp.test.operator + exp.test.right.name;
    statements.push({line: exp.loc.start, type: exp.type, name: left, condition: condition, value: exp.right.value});
    let body = exp.body.body;
    body_iter(body);
}

function return_handle(statement){
    statements.push({line: exp.loc.start, type: statement, name: statement.argument.name, condition: condition, value: exp.right.value});
}

function body_iter(body){
    for(let i=0;i<body.length;++i){
        choose(body[i]);
    }
}

function if_handle(exp){
    let condition = exp.test.left.name + exp.test.operator + exp.test.right.name;
    statements.push({line: exp.loc.start, type: exp.type, name: exp.left.name, condition: condition, value: exp.right.value});
    choose(exp.consequent);
    choose(exp.alternate);

}

function array_handle(array){
    let array_name = array.name;
    let array_property = array.property;
    let name = array_name + '[';
    if(array_property.hasOwnProperty('object')){
        name = name + array_handle(array_property);
    }
    name = name + ']';
    return name;
}


function choose(statement){
    switch (statement.type) {
    case 'BlockStatement':
        block_statement_handle(statement);
        break;
    case 'ExpressionStatement':
        expression_handle(statement);
        break;
    case 'WhileStatement':
        while_handle(statement);
        break;
    case 'IfStatement':
        if_handle(statement);
        break;
    case 'ReturnStatement':
        return_handle(statement);
        break;
    }
}



// function kindof(){
//     switch () {
//     case 'Identifier':
//         break;
//     case 'MemberExpression':
//
//         break
//
//
//     }
// }

// switch (body[i].type) {
// case 'BlockStatement':
//     block_statement_handle();
//     break;
// case 'ExpressionStatement':
//     expression_handle();
//     break;
// case 'WhileStatement':
//     while_handle();
//     break;
// case 'IfStatement':
//     if_handle();
// // case 'ReturnStatement':
// //     return_handle();
// //     break;
// }