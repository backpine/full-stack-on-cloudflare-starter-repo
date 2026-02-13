# Workflows

[destination-evaluation-workflow | cloudflare](dash.cloudflare.com/dba950c0645b0e21ff1ef9d7465012ac/workers/workflows/destination-evaluation-workflow/instances)

## Debugging
If you need to debug a workflow, do it on the worker it's deployed to.

A workflow is like a resource. The constructor will not be called when triggering a workflow.
If you need to access a dep, if needs to be stood up within the workflow.

```
Failed query: insert into "destination_evaluations" ("id", "link_id", "account_id", "destination_url", "status", "reason", "created_at") values (?, null, ?, ?, ?, ?, (CURRENT_TIMESTAMP)) params: 2257a27c-6b3f-4910-a698-b965772c5985,testaccoundid,https://www.aliexpress.us/item/3256807855533534.html?spm=a2g0o.productlist.main.2.4ac2129cS7Fw5l&algo_pvid=d9a18b39-b111-43ba-a164-2303b305b51f&algo_exp_id=d9a18b39-b111-43ba-a164-2303b305b51f-1&pdp_ext_f={%22order%22%3A%22610%22%2C%22eval%22%3A%221%22%2C%22fromPage%22%3A%22search%22}&pdp_npi=6%40dis!USD!1043.75!252.34!!!7203.24!1741.48!%402103212b17705165836294275ea4fa!12000043612523513!sea!US!0!ABX!1!0!n_tag%3A-29910%3Bd%3Aae9494bd%3Bm03_new_user%3A-29895%3BpisId%3A5000000200565977&curPageLogUid=LqtsSI5gs6yg&utparam-url=scene%3Asearch|query_from%3A|x_object_id%3A1005008041848286|_p_origin_prod%3A,UNKNOWN_STATUS,The webpage content does not contain any information about product availability or unavailability. It appears to be a generic webpage with links to various sections and policies, but no product details are provided.
```
