# **GitBook PlantUml Plugin**

Modified version of Gitbook PlantUml plugin. Originally from
- [lyhcode's version](https://github.com/lyhcode/gitbook-plugin-plantuml)
- [andrescamera's version](https://github.com/andrescamera/gitbook-plugin-plantuml)

This is a sample plugin for GitBook and is specially adapted for GitBook from [PlantUML](http://www.plantuml.com/index.html). Gitbook PlantUml plugin is used to select from markdown uml and converting it into a picture format svg.

**Example:**

*Text format uml:*

<pre><code>```uml
@startuml

	Class Stage
	Class Timeout {
		+constructor:function(cfg)
		+timeout:function(ctx)
		+overdue:function(ctx)
		+stage: Stage
	}
 	Stage &lt;|-- Timeout

@enduml
```
</code></pre>

![](./images/uml.png)

***Image uml.***

**How to use it:**
--------------

0. Environment requirements
    - Java
    - [Graphviz](http://www.graphviz.org/)

1. Install plugin from github

    `$ npm install https://github.com/...`  
    (Click **Clone or download** button to get URL)

2. Configure plugin in `book.json`.

```json
{
    "plugins": ["plantuml"]
}
```

This plugin only works in your local machine. You need to play with local `gitbook` (command-line tool) to pre-compile all uml images.

```$ gitbook serve yourbook```

or

```$ gitbook build yourbook```

## TODO

- Integerate with docker image [billryan's docker-gitbook](https://github.com/billryan/docker-gitbook) to make it buildable
