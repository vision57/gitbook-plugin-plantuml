var fs = require('fs');
var mkdirp = require('mkdirp');
var crypto = require('crypto');
var plantuml = require('node-plantuml');
var re = /^```uml((.*\n)+?)?```$/im;
var path = require('path');

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
            umlPath = path.join(this.options.output, 'assets', 'images', 'uml');
            mkdirp.sync(umlPath);
        },

        // This is called after the book generation
        "finish": function() {
            console.log("finish gitbook-plugin-plantuml!");
        },

        // The following hooks are called for each page of the book
        // and can be used to change page content (html, data or markdown)


        // Before parsing markdown
        "page:before": function(page) {
            var content = page.content;
            console.log('pathhh del uml ' + umlPath);

            while ((match = re.exec(content))) {
                var rawBlock = match[0];
                var umlBlock = match[1];

		var md5 = crypto.createHash('md5').update(umlBlock).digest('hex');
                var umlFile = path.join(umlPath, md5 + '.uml');
                fs.writeFileSync(umlFile, match[1], 'utf8');

		var gen = plantuml.generate(umlFile, {
                    format: 'png'
                });
                gen.out.pipe(fs.createWriteStream(umlFile.replace('.uml', '.png')));

                var svgTag = ['![](', '../assets/images/uml/', md5, '.png)'].join('');
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
