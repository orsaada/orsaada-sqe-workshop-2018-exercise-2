import $ from 'jquery';
import {parseCode, symbolic_sub, evaluateCode,setValues} from './code-analyzer';

let escodegen = require('escodegen');

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let input = $('#codePlaceholder').val();
        let parsedCode = parseCode(input);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        let parameters = $('#parameters').val();
        let parsedParams = parseCode(parameters);
        console.log(parsedParams);
        let a = parsedParams.body[0].expression;
        if(a.hasOwnProperty('expressions'))
            a = a.expressions;
        setValues(a);
        parsedCode = symbolic_sub(parsedCode);
        let codeAfterSub = escodegen.generate(parsedCode);
        let linesColor= evaluateCode(parseCode(codeAfterSub),[]);
        colorify(codeAfterSub,linesColor);
    });
});


function colorify(str,linesColor){
    let lines = str.split('\n');
    let body = document.getElementsByTagName('body')[0];
    for(let i = 0;i<lines.length;++i){
        let element = document.createElement('line'+i);
        let linePar = document.createTextNode(lines[i]);
        body.appendChild(element);
        element.appendChild(linePar);
        element.appendChild(document.createElement('br'));
        let color = checkColor(i,linesColor);
        if(color !== null){
            if(color === 'green')
                element.style.backgroundColor = 'green';
            else
                element.style.backgroundColor = 'red';
        }
    }
}

function checkColor(lineNumber,linesColor){
    for(let i=0;i<linesColor.length;++i){
        if(linesColor[i].line === lineNumber){
            return linesColor[i].color;
        }
    }
    return null;
}