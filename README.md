#Sample project

* You can use this project as a template.
* Run:
    * If using user/password: `git clone https://github.com/aviram26/sqe-workshop-2018-sample-project.git` 
    * If using SSH key: `git clone git@github.com:aviram26/sqe-workshop-2018-sample-project.git`
* To install all libraries, run: `npm install`
* For code parsing, this project uses the [Esprima](http://esprima.org/) library.
    * See example usage in `src/js/code-analyzer.js`
* To run the project:
    * From the command-line run: `npm start`
    * After the bundler is done, execute the `index.html` from your IDE (preferably `WebStorm`)
    * Try the parser... 
* For testing, this project uses the [Mocha](https://mochajs.org/) library.
    * From the command-line run: `npm run test`
* For coverage, this project uses the [nyc](https://github.com/istanbuljs/nyc) library.
    * From the command-line run: `npm run coverage`
* For linting, this project uses the [ESLint](https://eslint.org/) library.
    * From the command-line run: `npm run lint`


### Example for I/O

The input:

```javascript
function binarySearch(X, V, n){
    let low, high, mid;
    low = 0;
    high = n - 1;
    while (low <= high) {
        mid = (low + high)/2;
        if (X < V[mid])
            high = mid - 1;
        else if (X > V[mid])
            low = mid + 1;
        else
            return mid;
    }
    return -1;
}
```

Should produce:

Line | Type | Name | Value
--- | --- | --- | ---
1 | FunctionDeclaration | binarySearch | 
1 | Param | X |
... | ... | ... | ...
2 | VariableDeclarator | low | 0
... | ... | ... | ...
