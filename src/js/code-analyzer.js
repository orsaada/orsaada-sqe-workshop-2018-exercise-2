import * as esprima from 'esprima';
let estraverse = require('estraverse');
let escodegen = require('escodegen');
let params = [], values = [],params_values = [];

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{loc : true});
};

function setValues(inputValues){
    values = inputValues;
}

function symbolic_sub(parsedCode){
    let func = null,table = [];
    estraverse.traverse(parsedCode, {
        enter: function (node) {
            if (node.type === 'FunctionDeclaration'){
                func = node;
                this.skip();
            }
            if(node.type === 'VariableDeclaration'){
                sub_variable_declaration_handle(node,table);
                this.remove();
            }
        }
    });
    return symbolic_sub_helper(func,table);
}

function symbolic_sub_helper(func,table){
    params_values = [];
    params = func.params;
    for(let i = 0; i < params.length ;++i)
        params_values.push({name: params[i].name,content: values[i]});
    return inside_function_sub(func ,table);
}

function inside_function_sub(parsedCode,table){
    parsedCode = estraverse.replace(parsedCode, {
        enter: function (node) {
            if(expression_handle(node,table)) {
                this.remove();
            }
            if(node.type === 'VariableDeclaration'){
                sub_variable_declaration_handle(node,table);
                this.remove();
            }
            if(node.type === 'ReturnStatement'){
                return_handle(node,table);
            }
            if(node.type === 'IfStatement')
                if_handle(node,table);
        }
    });
    return parsedCode;
}

function expression_handle(node,table){
    return node.type === 'ExpressionStatement' && node.expression.type === 'AssignmentExpression' && assignment_handle(node.expression, table);
}

function sub_variable_declaration_handle(node,table){
    for(let i=0;i<node.declarations.length;i++)
        sub_variable_declrator_handle(node.declarations[i], table);
}

function sub_variable_declrator_handle(tree,table){
    tree.init = estraverse.replace(tree.init, {
        enter: function (node) {
            if (node !== null && node.type === 'Identifier'){
                let found = contains(node,table);
                if(!isParam(node) && found > -1) {
                    return table[found].content;
                }
            }
        },
    });
    table.push({name: tree.id.name, content: tree.init});
}

function contains(node, table){
    let name;
    if(node.type === 'MemberExpression'){
        name = node.object.name;
    }
    else{ //node.type === 'Identifier'
        name = node.name;
    }
    let found = -1;
    for(let i =0;i<table.length;++i){
        if(table[i].name === name) {
            return i;
        }
    }
    return found;
}

function copy_array(table){
    let newTable = [];
    for(let i=0;i<table.length;++i){
        newTable.push({name: table[i].name ,content: table[i].content});
    }
    return newTable;
}

function isParam(node){
    let name;
    if(node.type === 'MemberExpression'){
        name = node.object.name;
    }
    else
        name = node.name;
    for(let i =0;i<params_values.length;++i){
        if(params_values[i].name === name) {
            return true;
        }
    }
    return false;
}

function assignment_handle(tree,table){
    tree.right = estraverse.replace(tree.right, {
        enter: function (node) {
            if (node.type === 'Identifier'){
                let found =contains(node,table);
                if(found > -1)
                    return table[found].content;
            }
        },
    });
    assign_in_assignment_handle(tree,table);
    return !isParam(tree.left);

}

function assign_in_assignment_handle(tree,table){
    let index = contains(tree.left, table);
    if(index > -1){
        let found = contains(tree.left,table);
        if(table[found].content!== null && table[found].content.type === 'ArrayExpression'){
            let array = table[found].content;
            array.elements[tree.left.property.value] = tree.right;
        }
        else
            table[found].content = tree.right;
    }
    else{
        table.push({name: tree.left.name ,content: tree.right});
    }
}

function if_handle(tree,table){
    estraverse.replace(tree.test, {
        enter: function (node) {
            if(node.type ==='Identifier'){
                if(!isParam(node)){
                    let found = contains(node,table);
                    if(found > -1){
                        console.log('c');
                        return table[found].content;
                    }
                }
            }
        },
    });
    if(tree.consequent !==null) {
        console.log('b');
        inside_function_sub(tree.consequent, copy_array(table));
    }
    if(tree.alternate !== null)
        inside_function_sub(tree.alternate,copy_array(table));
}

function return_handle(tree,table){
    estraverse.replace(tree , {
        enter: function (node) {
            if(node.type ==='Identifier' && !isParam(node)){
                let found = contains(node,table);
                if(found > -1){
                    console.log('a');
                    return table[found].content;
                }
            }
        }
    });
}

function evaluateCode(parsedCode,linesColor){
    estraverse.replace(parsedCode, {
        enter: function (node) {
            if(node.type === 'Identifier'){
                let index = getParam(node);
                if(index > -1)
                    return params_values[index].content;
            }
        }
    });
    estraverse.replace(parsedCode, {
        enter: function (node) {
            if(node.type === 'IfStatement'){
                let x = eval(escodegen.generate(node.test));
                x ? linesColor.push({line : node.test.loc.start.line -1,color: 'green'}) : linesColor.push({line : node.test.loc.start.line -1,color: 'red'});
            }
        }
    });
    return linesColor;
}

function getParam(node){
    for(let i =0;i<params_values.length;++i){
        if(node.name === params_values[i].name)
            return i;
    }
    return -1;
}

export {parseCode,symbolic_sub, evaluateCode, params_values,setValues};