var fs = require('fs');
var mkdirp = require('mkdirp');
var crypto = require('crypto');
var plantuml = require('node-plantuml');
var re = /^```uml((.*\n)+?)?```$/im;
var path = require('path');

var promises = [];

module.exports = {
    hooks: {
        // This is called before the book is generated
        "init": function() {
            console.log("init gitbook-plugin-plantuml!");
            umlPath = path.join(this.options.output, 'assets', 'images', 'uml');
            mkdirp.sync(umlPath);
        },
        // Before parsing markdown
        "page:before": function(page) {
            var content = page.content;

            while ((match = re.exec(content))) {
                var rawBlock = match[0];
                var umlBlock = match[1];

                var md5 = crypto.createHash('md5').update(umlBlock).digest('hex');
                var umlFile = path.join(umlPath, md5 + '.uml');
                fs.writeFileSync(umlFile, match[1], 'utf8');

                promises.push(new Promise(function (resolve, reject) {
                    var gen = plantuml.generate(umlFile,
                    { format: 'png' },
                    function (chunk, data) {
                        if (data) resolve();
                    });
                    gen.out.pipe(fs.createWriteStream(umlFile.replace('.uml', '.png')));
                }));

                var svgTag = ['![](', '/assets/images/uml/', md5, '.png)'].join('');
                page.content = content = content.replace(rawBlock, svgTag);
            }

            return page;
        },
        "finish": function() {
            return Promise.all(promises);
        }
    }
};
