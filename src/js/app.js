import $ from 'jquery';
import {parseCode} from './code-analyzer';

import {create_objects} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        create_objects(parsedCode);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
    });
});
