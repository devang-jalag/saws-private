# How I'm Deploying: Infrastructure as Code

## Reason
I'm going with Terraform to spin up my AWS and GCP resources. It makes the setup completely reproducible, which is great for showing my work to the TA, and it's basically the industry standard right now. No manual console, everything is defined in code kinda like Git but for infrastructure.

## Folder Structure (Probable draft)
For keeping things tidy here is the probable folder structure :

* `/terraform`
  * `main.tf` (My starting point that pulls in the modules below)
  * `variables.tf` (Things like which region I'm using, environment tags, etc.)
  * `providers.tf` (Setting up connections to AWS and GCP)
  * `/modules`
    * `/auth` (Everything Cognito related)
    * `/compute` (Lambda functions and their permissions)
    * `/database` (DynamoDB setups)
    * `/messaging` (All the SQS queues and SNS topics)
    * `/hosting` (Where I define the Fargate setup and container registries)

## References
[1] HashiCorp, "AWS Provider," Terraform Registry. [Online]. Available: https://registry.terraform.io/providers/hashicorp/aws/latest/docs. [Accessed: Jun. 11, 2026].
[2] HashiCorp, "Backend Type: s3," Terraform Documentation. [Online]. Available: https://developer.hashicorp.com/terraform/language/backend/s3. [Accessed: Jun. 11, 2026].
