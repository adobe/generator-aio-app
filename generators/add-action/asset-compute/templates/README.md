# example-custom-worker

This is a very simple example of a 3rd party Asset Compute worker. It generates a rendition by simply [copying](https://git.corp.adobe.com/nui/example-custom-worker/blob/master/worker.js#L31) the source file.

It is based on [Project Firefly](https://wiki.corp.adobe.com/pages/viewpage.action?pageId=1776230957) and the [aio](https://github.com/adobe/aio-cli) developer tool.

## Code

The key elements are
- [worker.js](worker.js) - nodejs action with the worker logic
- [manifest.yml](manifest.yml) - describes the Runtime action that gets deployed using `aio`
- [tests/](tests) - worker test cases

In the [manifest.yml](manifest.yml) the single action is set to be a web action and that it requires standard Adobe ID authentication & authorization:

```
packages:
  __APP_PACKAGE__:
    actions:
      worker:
        function: 'worker.js'
        runtime: 'nodejs:10'
        web: true
        annotations:
          require-adobe-auth: true
```

## Install

Requirements:

* [aio cli](https://github.com/adobe/aio-cli)
* [nui cli](https://git.corp.adobe.com/nui/asset-compute-cli) (temporarily - until the [asset-compute plugin for aio](https://git.corp.adobe.com/nui/aio-cli-plugin-asset-compute) is ready)
* Adobe IO Runtime namespace where you want to install the worker into
* `.env` file in the root directory with the credentials of the Runtime namespace, and these variables:
  - `AIO_RUNTIME_NAMESPACE` for the namespace name (`NAMESPACE` from `.wskprops`)
  - `AIO_RUNTIME_AUTH` for the namespace name (`AUTH` from `.wskprops`)
  - Make sure to not commit the `.env` file to git!
  - Also note that `aio` & Firefly will soon offer a mechanism to get the credentials automatically from your Firefly Workspace, making this manual `.env` file setup obsolete.
  
### Test

This runs eslint and the worker test cases in [tests](tests):

```
npm test
```

### Deploy

```
aio app deploy
```

The deployed version should look like this if you run `wsk action list`:

```
actions
/ns/example-custom-worker-1.0.0/worker                           private sequence
/ns/example-custom-worker-1.0.0/__secured_worker                 private nodejs:10
```

The `aio app deploy` output will show the URL of the worker:

```
https://ns.adobeioruntime.net/api/v1/web/example-custom-worker-1.0.0/worker
```

### Use

To use the custom worker with the Asset Compute Service, include a new rendition in the [`/process` request](https://git.corp.adobe.com/nui/nui/blob/master/doc/api.md#process) with the `worker` field set to the worker URL:

```
"renditions": [
    {
        "worker": "https://ns.adobeioruntime.net/api/v1/web/example-custom-worker-master/worker",
        "name": "image.jpg"
    }
]
```

(The `name` field is only needed for use in Meahana to display image renditions in the browser).
