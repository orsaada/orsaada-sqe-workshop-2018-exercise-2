import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{loc: true});
};

export {parseCode};

let statements = [];

export  {statements};

const func = {
    'FunctionDeclaration': function_handle,
    'VariableDeclaration': variable_handle,
    'Identifier': identifier_handle,
    'ExpressionStatement': expression_handle,
    'WhileStatement': while_handle,
    'IfStatement': if_handle,
    'ReturnStatement': return_handle,
    'ForStatement': for_handle,
    'BlockStatement': body_iter,
    'AssignmentExpression': assignment_handle,
    'BinaryExpression': binary_handle,
    'UpdateExpression': update_handle,
    'MemberExpression': member_handle,
    'Literal': literal_handle,
    'UnaryExpression': unary_handle,
    'SequenceExpression': sequence_handle,
    'LogicalExpression': logical_handle,
    'ArrayExpression' : array_handle
};

function identifier_handle(identifier){
    return identifier.name;
}

function create_objects(parseCode) {
    statements = [];
    program_handle(parseCode);
    return statements;
}
export {create_objects};

function program_handle(program) {
    body_iter(program);
}

function function_handle(exp) {
    let func_name = func[exp.id.type](exp.id);
    statements.push({line: exp.id.loc.start.line, type: exp.type, name: func_name, condition: '', value: ''});
    for (let i =0; i<exp.params.length;i++) {
        let param_name = func[exp.params[i].type](exp.params[i]);
        statements.push({line: exp.params[i].loc.start.line, type: exp.params[i].type, name: param_name, condition: '', value: ''});
    }
    func[exp.body.type](exp.body);
}

function variable_handle(obj) {
    for (let i=0; i<obj.declarations.length; ++i) {
        let dec = obj.declarations[i];
        let init;
        dec.init === null ? init = '': init = func[dec.init.type](dec.init);
        statements.push({line: obj.loc.start.line, type: obj.type, name: dec.id.name, condition: '', value: init});
    }
}

function assignment_handle(exp){
    let name = func[exp.left.type](exp.left);
    let value = func[exp.right.type](exp.right);
    statements.push({line: exp.loc.start.line, type: exp.type, name: name, condition: '', value: value});

}
function while_handle(exp) {
    let condition = func[exp.test.type](exp.test);
    statements.push({line: exp.loc.start.line, type: exp.type, name: '', condition: condition, value: ''});
    func[exp.body.type](exp.body);
}

function return_handle(statement){
    let value = func[statement.argument.type](statement.argument);
    statements.push({line: statement.loc.start.line, type: statement.type, name: '', condition: '', value: value});
}

function body_iter(statement){
    let body = statement.body;
    for(let i=0;i<body.length;++i){
        func[body[i].type](body[i]);
    }
}

function if_handle(exp){
    let condition = func[exp.test.type](exp.test);
    statements.push({line: exp.loc.start.line, type: exp.type, name: '', condition: condition, value: ''});
    func[exp.consequent.type](exp.consequent);
    if(exp.alternate !== null ) {
        if(exp.alternate.type === 'BlockStatement')
            statements.push({line: exp.loc.start.line, type: 'ElseStatement', name: '', condition: '', value: ''});
        func[exp.alternate.type](exp.alternate);
    }

}

function for_handle(statement){
    let condition = func[statement.test.type](statement.test);
    statements.push({line: statement.loc.start.line, type: statement.type, name: '', condition: condition, value: ''});
    func[statement.init.type](statement.init);
    func[statement.update.type](statement.update);
    func[statement.body.type](statement.body);
}

function binary_handle(exp){
    let left = func[exp.left.type](exp.left);
    let right = func[exp.right.type](exp.right);
    let operator = exp.operator;
    return left+operator+right;
}

function update_handle(exp){
    let name = func[exp.argument.type](exp.argument);
    let operator = exp.operator;
    let value = exp.prefix ? operator+name: name+operator;
    statements.push({line: exp.loc.start.line, type: exp.type, name: name, condition: '', value: value});
}

function literal_handle(literal){
    return literal.raw;
}

function member_handle(exp) {
    let obj = func[exp.object.type](exp.object);
    let property = func[exp.property.type](exp.property);
    return obj+'['+property+']';
}

function expression_handle(exp){
    func[exp.expression.type](exp.expression);
}

function unary_handle(exp){
    let argu = func[exp.argument.type](exp.argument);
    return exp.operator+argu;
}

function sequence_handle(exp){
    for(let i = 0;i<exp.expressions.length ;i++){
        func[exp.expressions[i].type](exp.expressions[i]);
    }
}

function logical_handle(exp){
    let left = func[exp.left.type](exp.left);
    let right = func[exp.right.type](exp.right);
    return left+exp.operator+right;

}

function array_handle(exp){
    let array = '[';
    for(let i =0;i<exp.elements.length;i++){
        array = array+func[exp.elements[i].type](exp.elements[i])+',';
    }
    if(exp.elements.length >0)
        array = array.substring(0,array.length-1);
    return array+']';
}