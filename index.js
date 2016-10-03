var count = 0;
var spawn = require('child_process').spawn;
var fs = require('fs');
var mkdirp = require('mkdirp');
var crypto = require('crypto');
var re = /^```uml((.*\n)+?)?```$/im;
var path = require('path');

var umlPath, mode;

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
			umlPath = path.join(this.options.output, 'assets', 'images', 'uml');
			mode = this.options._name;
			mkdir('-p', umlPath);
		}

	,	"page:before": function(page) {
			var content = page.content;

			while((match = re.exec(content))) {
				var rawBlock = match[0];
				var umlBlock = match[1];
				var md5 = crypto.createHash('md5').update(umlBlock).digest('hex');
				var umlFile = path.join(umlPath, md5+'.uml');

				fs.writeFileSync(umlFile, match[1], 'utf8');
				
				if(0 == exec(['java -jar', this.options.pluginsConfig.plantuml.jarPath, '-tsvg', umlFile, '-o', umlPath].join(' ')).code) {
					var svgPath = ('serve' == mode) ? '/assets/images/uml/' : ['file://', umlPath, '/'].join('');
					var svgTag = ['![](', svgPath, md5, '.svg)'].join('');
					
					page.content = content = content.replace(rawBlock, svgTag);
				}
			}
			
			return page;
		},

		"page": function(page) { return page; },
		"page:after": function(page) { return page; }
    }
};
