import $ from 'jquery';

import {parseCode, symbolic_sub, evaluateCode, params_values,checkColor,values} from './code-analyzer';

let escodegen = require('escodegen');

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let input = $('#codePlaceholder').val();
        let parameters = $('#parameters').val();
        let args =text_manipulation(parameters);
        let parsedCode = parseCode(input,args);
        parsedCode = symbolic_sub(parsedCode);
        //let doc = document.getElementById('subCode');
        let str = escodegen.generate(parsedCode);
        //str = str.replace(/(?:\r\n|\r|\n)/g, '<br>');
        //doc.innerHTML = str;
        for(let i = 0;i<params_values.length;++i){
            params_values[i].content = {type: 'Literal', value:parseInt(values[i], 10), raw: values[i]};
        }
        evaluateCode(parseCode(str),params_values);
        colorify(str);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        //$('#parsedCode').val(escodegen.generate(parsedCode));
    });
});

function text_manipulation(parameters){
    parameters = parameters.trim();
    // break the textblock into an array of lines
    let lines = parameters.split('\n');
    let words = parameters.split(' ');
    let argumentLine;
    (words[0] !== 'function'&& words[0] !== 'let') ? argumentLine = lines.splice(0,1) : argumentLine = lines.splice(-1,1);
    return argumentLine[0].split(',');
    // join the array back into a single string
    // let codeToParse = lines.join('\n');
}

function colorify(str){
    console.log(str);
    let lines = str.split('\n');
    let body = document.getElementsByTagName('body')[0];
    //let paragraph = document.getElementById('afterCode');
    for(let i = 0;i<lines.length;++i){
        let element = document.createElement('line'+i);
        let linePar = document.createTextNode(lines[i]);
        body.appendChild(element);
        //paragraph.appendChild(linePar);
        element.appendChild(linePar);
        element.appendChild(document.createElement('br'));
        let color = checkColor(i);
        if(color !== null){
            if(color === 'green')
                element.style.backgroundColor = 'green';
            else
                element.style.backgroundColor = 'red';
        }
    // paragraph.appendChild(linePar);
    }
}