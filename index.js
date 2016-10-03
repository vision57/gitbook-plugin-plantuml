var count = 0;
var spawn = require('child_process').spawn;
var fs = require('fs');
var mkdirp = require('mkdirp');
var crypto = require('crypto');
var plantuml = require('node-plantuml');
var re = /^```uml((.*\n)+?)?```$/im;

function parseUml(page, umlPath) {
    uml = page.content.match(/^```uml((.*\n)+?)?```$/igm);
    if (uml) {
        fs.writeFileSync(umlPath, uml);
        return true;
    }
    return false;
}

module.exports = {
    book: {
        assets: "./book",
        js: [
            "test.js"
        ],
        css: [
            "test.css"
        ],
        html: {
            "html:start": function() {
                return "<!-- Start book " + this.options.title + " -->"
            },
            "html:end": function() {
                return "<!-- End of book " + this.options.title + " -->"
            },

            "head:start": "<!-- head:start -->",
            "head:end": "<!-- head:end -->",

            "body:start": "<!-- body:start -->",
            "body:end": "<!-- body:end -->"
        }
    },
    hooks: {
        // For all the hooks, this represent the current generator

        // This is called before the book is generated
        "init": function() {
            console.log("init gitbook-plugin-plantuml!");
        },

        // This is called after the book generation
        "finish": function() {
            console.log("finish gitbook-plugin-plantuml!");
        },

        // The following hooks are called for each page of the book
        // and can be used to change page content (html, data or markdown)


        // Before parsing markdown
        "page:before": function(page) {
            /*// page.path is the path to the file
            // page.content is a string with the file markdown content

            var pathToken = page.path.split('/')

            var chapterPath
            var assetPath
            var baseName
            var umlPath

            if (pathToken.length == 1) {
                chapterPath = '.'
                assetPath = './_book/assets/images/uml/'
                baseName = pathToken[0].split('.')[0]
            }
            else {
                console.log("pathToken: " + pathToken);
                chapterPath = pathToken[0]
                assetPath = '../assets/images/uml/' + chapterPath + '/'
                baseName = pathToken[1].split('.')[0]
                console.log("baseName: " + baseName);
            }

            umlPath = './_book/assets/images/uml/' + chapterPath + '/' + baseName + '.uml'
            

            mkdirp.sync('./_book/assets/images/uml/' + chapterPath);

            var hasUml = parseUml(page, umlPath);
            if (!hasUml) { return page; }

            console.log('processing uml... %j', page.path);

            var text = fs.readFileSync(umlPath, 'utf8');

            var md5sum = crypto.createHash('sha1').update(text).digest('hex');

            var lastmd5sum = ''

            try {
                lastmd5sum = fs.readFileSync(umlPath + '.sum');
            }
            catch (e) {
            }

            var isUpdateImageRequired = (lastmd5sum != md5sum);

            fs.writeFileSync(umlPath + '.sum', md5sum);

            var lines = text.split('```,');

            //console.log('%j', lines);

            //UML
            if (isUpdateImageRequired) {
                var gen = plantuml.generate(umlPath, {format:'png'});
                gen.out.pipe(fs.createWriteStream(umlPath.replace('.uml', '.png')));
            }

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (i < (lines.length-1)) {
                    line += '```';
                }
                if (i == 0) {
                    page.content = page.content.replace(line, '![](' + assetPath + baseName + '.png)');
                    continue;
                }
                if (i < 10) {
                    page.content = page.content.replace(line, '![](' + assetPath + baseName + '_00' + i + '.png)');
                    continue;
                }
                if (i >= 10 && i < 100) {
                    page.content = page.content.replace(line, '![](' + assetPath + baseName + '_0' + i + '.png)');
                    continue;
                }
                if (i >= 100) {
                    page.content = page.content.replace(line, '![](' + assetPath + baseName + '_' + i + '.png)');
                    continue;
                }
            };
            //page.content = page.content.replace(/^```uml((.*\n)+?)?```$/g, '');
            // Example:
            //page.content = "# Title\n" + page.content;
            */
            
            var content = page.content;

			while((match = re.exec(content))) {
				var rawBlock = match[0];
				var umlBlock = match[1];
				var md5 = crypto.createHash('md5').update(umlBlock).digest('hex');
				var umlFile = path.join(umlPath, md5+'.uml');

				fs.writeFileSync(umlFile, match[1], 'utf8');
				
                
                var gen = plantuml.generate(umlPath, {format:'png'});
                gen.out.pipe(fs.createWriteStream(umlPath.replace('.uml', '.png')));
                
                var svgPath = ('serve' == mode) ? '/assets/images/uml/' : ['file://', umlPath, '/'].join('');
                var svgTag = ['![](', svgPath, md5, '.svg)'].join('');
					
                page.content = content = content.replace(rawBlock, svgTag);
			}

            return page;
        },

        // Before html generation
        "page": function(page) {
            // page.path is the path to the file
            // page.sections is a list of parsed sections

            // Example:
            //page.sections.unshift({type: "normal", content: "<h1>Title</h1>"})

            return page;
        }
    }
};
