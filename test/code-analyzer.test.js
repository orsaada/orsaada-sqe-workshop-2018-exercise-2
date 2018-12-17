import assert from 'assert';
import {parseCode, create_objects,statements} from '../src/js/code-analyzer';

describe('Function and While', () => {
    it('WhileStatement', () => {
        create_objects(parseCode('while (low <= high) {}'));
        assert(JSON.stringify(statements) === '[{"line":1,"type":"WhileStatement","name":"",' +
            '"condition":"low<=high","value":""}]');
    });

    it('FunctionDeclaration', () => {
        create_objects(parseCode('function binarySearch(X, V, n){ return -1;}'));
        assert(JSON.stringify(statements) === '[{"line":1,"type":"FunctionDeclaration","name":"binarySearch",' +
            '"condition":"","value":""},{"line":1,"type":"Identifier","name":"X","condition":"","value":""},' +
            '{"line":1,"type":"Identifier","name":"V","condition":"","value":""},{"line":1,"type":"Identifier"' +
            ',"name":"n","condition":"","value":""},{"line":1,"type":"ReturnStatement","name":"","condition":""' +
            ',"value":"-1"}]');
    });
});

describe('For Loops tests', () => {
    it('for', () => {
        create_objects(parseCode('for(i=0;i<10;++i){}'));
        assert(JSON.stringify(statements) === '[{"line":1,"type":"ForStatement","name":"","condition":"i<10",' +
            '"value":""},{"line":1,"type":"AssignmentExpression","name":"i","condition":"","value":"0"}' +
            ',{"line":1,"type":"UpdateExpression","name":"i","condition":"","value":"++i"}]');
    });

    it('update for prefix', () => {
        create_objects(parseCode('i++;'));
        assert(JSON.stringify(statements) === '[{"line":1,"type":"UpdateExpression","name":"i","condition":"",' +
            '"value":"i++"}]');
    });
});


describe('If Loops tests', () => {
    it('IfStatement', () => {
        create_objects(parseCode('if(A[5] >3){}else{y=5;}'));
        assert(JSON.stringify(statements) === '[{"line":1,"type":"IfStatement","name":"","condition":"A[5]>3",' +
            '"value":""},{"line":1,"type":"ElseStatement","name":"","condition":"","value":""},{"line":1,"type":' +
            '"AssignmentExpression","name":"y","condition":"","value":"5"}]');
    });

    it('elseif', () => {
        create_objects(parseCode('if(A[5] >3){}else if(a==5){}'));
        assert(JSON.stringify(statements) === '[{"line":1,"type":"IfStatement","name":"","condition":"A[5]>3",' +
            '"value":""},{"line":1,"type":"IfStatement","name":"","condition":"a==5","value":""}]');
    });

});

describe('variables', () => {
    it('let x = 1 is working', () => {
        create_objects(parseCode('let x = 1'));
        let data = statements.find(function (member) {
            return member.type === 'VariableDeclaration';
        });
        assert(data.line === 1);
        assert(data.type === 'VariableDeclaration');
        assert(data.name === 'x');
        assert(data.condition === '');
        assert(data.value === '1');
        assert(statements.length === 1);
    });

    it('Let statement', () => {
        create_objects(parseCode('let x;'));
        assert(JSON.stringify(statements) === '[{"line":1,"type":"VariableDeclaration","name":"x",' +
            '"condition":"","value":""}]');
    });
});




describe('unique expressions', () => {
    it('SequenceExpression', () => {
        create_objects(parseCode('x = 5, y =8'));
        assert(JSON.stringify(statements) === '[{"line":1,"type":"AssignmentExpression","name":"x","condition":"",' +
            '"value":"5"},{"line":1,"type":"AssignmentExpression","name":"y","condition":"","value":"8"}]');
    });

    it('logical', () => {
        create_objects(parseCode('if(a&&b){}'));
        assert(JSON.stringify(statements) === '[{"line":1,"type":"IfStatement","name":"","condition":"a&&b",' +
            '"value":""}]');
    });
});

describe('complex functions', () => {
    it('function a', () => {
        create_objects(parseCode(function_a));
        assert(JSON.stringify(statements) === '[{"line":1,"type":"FunctionDeclaration","name":"binarySearch",' +
            '"condition":"","value":""},{"line":1,"type":"Identifier","name":"X","condition":"","value":""},' +
            '{"line":1,"type":"Identifier","name":"V","condition":"","value":""},{"line":1,"type":"Identifier",' +
            '"name":"n","condition":"","value":""},{"line":2,"type":"VariableDeclaration","name":"low",' +
            '"condition":"","value":""},{"line":2,"type":"VariableDeclaration","name":"high","condition":"",' +
            '"value":""},{"line":2,"type":"VariableDeclaration","name":"mid","condition":"","value":""},{"line":3,' +
            '"type":"AssignmentExpression","name":"low","condition":"","value":"0"},{"line":4,"type":"AssignmentExp' +
            'ression","name":"high","condition":"","value":"n-1"},{"line":5,"type":"WhileStatement","name":"",' +
            '"condition":"low<=high","value":""},{"line":6,"type":"AssignmentExpression","name":"mid","condition":"",' +
            '"value":"low+high/2"},{"line":7,"type":"IfStatement","name":"","condition":"X<V[mid]","value":""},' +
            '{"line":8,"type":"AssignmentExpression","name":"high","condition":"","value":"mid-1"},' +
            '{"line":9,"type":"IfStatement","name":"","condition":"X>V[mid]","value":""},' +
            '{"line":10,"type":"AssignmentExpression","name":"low","condition":"",' +
            '"value":"mid+1"},{"line":12,"type":"ReturnStatement","name":"","condition":"",' +
            '"value":"mid"},{"line":14,"type":"ReturnStatement","name":"","condition":"","value":"-1"}]');
    });
});

describe('complex functions', () => {
    it('function b', () => {
        create_objects(parseCode(function_b));
        assert(JSON.stringify(statements) === '[{"line":1,"type":"FunctionDeclaration","name":"map","condition":"",' +
            '"value":""},{"line":1,"type":"Identifier","name":"f","condition":"","value":""},{"line":1,' +
            '"type":"Identifier","name":"a","condition":"","value":""},{"line":2,"type":"VariableDeclaration",' +
            '"name":"result","condition":"","value":"[]"},{"line":2,"type":"VariableDeclaration","name":"i",' +
            '"condition":"","value":""},{"line":3,"type":"ForStatement","name":"","condition":"i!=a[length]",' +
            '"value":""},{"line":3,"type":"AssignmentExpression","name":"i","condition":"","value":"0"},{"line":3,' +
            '"type":"UpdateExpression","name":"i","condition":"","value":"i++"},{"line":4,"type":' +
            '"AssignmentExpression","name":"result[i]","condition":"","value":"a[i]"},{"line":5,"type":' +
            '"ReturnStatement","name":"","condition":"","value":"result"}]');
    });

    it('array not empty', () => {
        create_objects(parseCode('a = [5,3];'));
        assert(JSON.stringify(statements) === '[{"line":1,"type":"AssignmentExpression","name":"a","condition":"","value":"[5,3]"}]');
    });
});

let function_a = 'function binarySearch(X, V, n){\n' +
    '    let low, high, mid;\n' +
    '    low = 0;\n' +
    '    high = n - 1;\n' +
    '    while (low <= high) {\n' +
    '        mid = (low + high)/2;\n' +
    '        if (X < V[mid])\n' +
    '            high = mid - 1;\n' +
    '        else if (X > V[mid])\n' +
    '            low = mid + 1;\n' +
    '        else\n' +
    '            return mid;\n' +
    '    }\n' +
    '    return -1;\n' +
    '}';

let function_b = 'function map(f, a) {\n' +
    '  var result = [],i; \n' +
    '  for (i = 0; i != a.length; i++)\n' +
    '    result[i] = a[i];\n' +
    '  return result;\n' +
    '}';