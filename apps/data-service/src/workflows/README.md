# Workflows

[destination-evaluation-workflow | cloudflare](dash.cloudflare.com/dba950c0645b0e21ff1ef9d7465012ac/workers/workflows/destination-evaluation-workflow/instances)

## Debugging
If you need to debug a workflow, do it on the worker it's deployed to.

A workflow is like a resource. The constructor will not be called when triggering a workflow.
If you need to access a dep, if needs to be stood up within the workflow.
