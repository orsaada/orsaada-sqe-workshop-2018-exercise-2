import * as esprima from 'esprima';
let estraverse = require('estraverse');
let escodegen = require('escodegen');
let params = [], values = [] ,linesColor = [],params_values = [];

const parseCode = (codeToParse,args) => {
    values = args;
    return esprima.parseScript(codeToParse,{loc : true});
};

function symbolic_sub(parsedCode){
    let func = null;
    estraverse.traverse(parsedCode, {
        enter: function (node) {
            if (node.type === 'FunctionDeclaration'){
                func = node;
                this.skip();
            }
        }
    });
    params_values = [];
    params = func.params;
    for(let i=0;i<params.length ;++i){
        params_values.push({name: params[i].name,content: {type: 'Literal', value:parseInt(values[i], 10), raw: values[i]}});
    }
    parsedCode = sub(func ,[]);
    return parsedCode;
}

function sub(parsedCode,table){ //
    parsedCode = estraverse.replace(parsedCode, {
        enter: function (node) {
            if(node.type === 'VariableDeclaration'){
                for(let i=0;i<node.declarations.length;i++)
                    variable_handle(node.declarations[i], table);
                this.remove();
            }
            if(node.type === 'ExpressionStatement' && node.expression.type === 'AssignmentExpression' && assignment_handle(node.expression, table)) {
                this.remove();
            }
            if(node.type === 'ReturnStatement'){
                return_handle(node,table);
                this.skip();
            }
            if(node.type === 'IfStatement')
                if_handle(node,table);
        }
    });
    return parsedCode;
}

function variable_handle(tree,table){
    tree.init = estraverse.replace(tree.init, {
        enter: function (node) {
            if (node.type === 'Identifier'){
                let found = contains(node,table);
                if(!isParam(node) && found > -1) {
                    return table[found].content;
                }
            }
        },
    });
    let found = contains(tree.id, table);
    if(found > -1)
        table[found].content = tree.init;
    else
        table.push({name: tree.id.name, content: tree.init});
}

function contains(node, table){
    let found = -1;
    for(let i =0;i<table.length;++i){
        if(table[i].name === node.name) {
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
    for(let i =0;i<params_values.length;++i){
        if(params_values[i].name === node.name) {
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
    if(!isParam(tree.left)){
        tree = isNotParamAssignment_handle(tree,table);
        return true;
    }
    let index = getParam(tree.left);
    params_values[index].content = tree.right;
    return false;
}

function isNotParamAssignment_handle(tree,table){
    let found = contains(tree.left,table);
    if(found < 0)
        table.push({name: tree.left.name, content: tree.right});
    else {
        table[found].content = tree.right;
    }
}

function if_handle(tree,table){
    estraverse.replace(tree.test, {
        enter: function (node) {
            if(node.type ==='Identifier'){
                if(!isParam(node)){
                    let found = contains(node,table);
                    if(found > -1){
                        return table[found].content;
                    }
                }
            }
        },
    });
    if(tree.consequent !==null)
        sub(tree.consequent,copy_array(table));
    if(tree.alternate !== null)
        sub(tree.alternate,copy_array(table));
}

function return_handle(tree,table){
    estraverse.replace(tree , {
        enter: function (node) {
            if(node.type ==='Identifier' && !isParam(node)){
                let found = contains(node,table);
                if(found > -1){
                    return table[found].content;
                }
            }
        }
    });
}

function evaluateCode(parsedCode,table){
    estraverse.replace(parsedCode, {
        enter: function (node) {
            if(node.type === 'AssignmentExpression') {
                evaluateCode(node.right,table);
                let index = getParam(node.left);
                table[index].content = node.right;
                this.skip();
            }
            if(node.type === 'Identifier'){
                let index = getParam(node);
                if(index > -1) {
                    return params_values[index].content;
                }
            }
            if(node.type === 'IfStatement'){
                if_evaluateCode(node,table);
            }
        }
    });
}

function if_evaluateCode(node,table){
    evaluateCode(node.test);
    let x = eval(escodegen.generate(node.test));
    x ? linesColor.push({line : node.test.loc.start.line -1,color: 'green'}) : linesColor.push({line : node.test.loc.start.line -1,color: 'red'});
    if(node.consequent !==null)
        evaluateCode(node.consequent,copy_array(table));
    if(node.alternate !== null)
        evaluateCode(node.alternate,copy_array(table));
}

function checkColor(lineNumber){
    for(let i=0;i<linesColor.length;++i){
        if(linesColor[i].line === lineNumber){
            return linesColor[i].color;
        }
    }
    return null;
}

function getParam(node){
    for(let i =0;i<params_values.length;++i){
        if(node.name === params_values[i].name)
            return i;
    }
    return -1;
}

export {parseCode,symbolic_sub, evaluateCode, params_values,checkColor,values};