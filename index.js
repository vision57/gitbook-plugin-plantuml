var fs = require('fs');
var mkdirp = require('mkdirp');
var crypto = require('crypto');
var plantuml = require('node-plantuml');
var re = /^```uml((.*\n)+?)?```$/im;
var path = require('path');

var promises = [];
var md5List = [];

module.exports = {
    hooks: {
        // This is called before the book is generated
        "init": function() {
            console.log("init gitbook-plugin-plantuml!");
            cachedPath = path.join('./assets', 'images', 'uml'); 
            umlPath = path.join(this.options.output, 'assets', 'images', 'uml'); // should same as above
            mkdirp.sync(umlPath);
            mkdirp.sync(cachedPath);
        },
        // Before parsing markdown
        "page:before": function(page) {
            var content = page.content;

            console.log("page:before gitbook-plugin-plantuml!");

            while ((match = re.exec(content))) {
                var rawBlock = match[0];
                var umlBlock = match[1];

                var md5 = crypto.createHash('md5').update(umlBlock).digest('hex');
                var cachedUmlFile = path.join(cachedPath, md5 + '.uml');
                var umlFile = path.join(umlPath, md5 + '.uml');
                
                md5List.push(md5)

                var lastMd5File = ''
                try {
                    if (fs.existsSync(cachedUmlFile)) {
                        console.log('puml cachedUmlFile exist: ' + cachedUmlFile);
                        lastMd5File = fs.readFileSync(cachedUmlFile);
                    }
                }
                catch (e) {
                }

                if (lastMd5File == umlBlock) {
                    var svgTag = ['![](', '/assets/images/uml/', md5, '.png)'].join('');
                    page.content = content = content.replace(rawBlock, svgTag);
                    //console.log('gitbook-plugin-plantuml same uml: ' + md5 + '.uml');
                } else {
                    fs.writeFileSync(cachedUmlFile, umlBlock, 'utf8');
                    //console.log('gitbook-plugin-plantuml start generate uml: ' + cachedUmlFile);
                    promises.push(new Promise(function (resolve, reject) {
                    var gen = plantuml.generate(cachedUmlFile,
                        { format: 'png' },
                        function (chunk, data) {
                            if (data) resolve();
                        });
                        var cachePngFile = cachedUmlFile.replace('.uml', '.png');
                        var pngFile = umlFile.replace('.uml', '.png');
                        //console.log('gitbook-plugin-plantuml generate success: ' + cachedUmlFile);
                        gen.out.pipe(fs.createWriteStream(cachePngFile));
                        gen.out.pipe(fs.createWriteStream(pngFile))
                    }));

                    var svgTag = ['![](', '/assets/images/uml/', md5, '.png)'].join('');
                    page.content = content = content.replace(rawBlock, svgTag);
                }

            }
            return page;
        },
        "finish": function() {
            var list = fs.readdirSync(cachedPath)
            list.forEach(function(file) {
                fileName = file.substring(0, file.lastIndexOf('.'))
                if (!md5List.includes(fileName)) {
                    var oldFile = cachedPath + "/" + file
                    //console.log('gitbook-plugin-plantuml delete old file: ' + oldFile);
                    fs.unlinkSync(oldFile);
                }
            })
            return Promise.all(promises);
        }
    }
};
