# Designing the 3-Step Login Process

## The Game Plan
There is a pretty strict security requirement for both Patients and Wellness Coordinators: a mandatory 3-stage login. Here's how I am structuring the flow and keeping track of the user's progress. I also decided to use API Gateway alongside Cognito, as they pair together so well for securing these endpoints.

## Step-by-Step Breakdown
1. **First Hurdle: Username & Password**
   * The user enters their basic credentials into my React app.
   * I shoot that over to AWS Cognito.
   * If it checks out, Cognito hands back a temporary session token. The user isn't fully in yet, just ready for the next test.

2. **Second Hurdle: The Security Question**
   * The app sees the user needs to answer their custom security question and asks it.
   * The user's response gets sent to a Lambda function (hitting an API Gateway endpoint first, which integrates perfectly with my Cognito setup).
   * Lambda checks my `Users` table in DynamoDB to see if the hash matches.
   * If they get it right, Lambda flags the session to move to the final challenge.

3. **Final Hurdle: The Caesar Cipher**
   * A Lambda function creates a random clue (like a healthcare code) and scrambles it using a Caesar shift.
   * I send both the scrambled text and the shift number to the frontend.
   * The user has to decipher it and submit their answer.
   * Lambda checks the work. If it's correct, it tells Cognito everything is good to go, and the user finally gets their JWT to access the app.

## Keeping It Secure
* I'm not giving people forever to do this. I need to set a timer—like 5 minutes tops—to finish all three steps.
* If someone messes up on the security question or the cipher, I kill the session immediately. They have to start all over from step one.

## References
[1] Amazon Web Services, "Custom authentication challenge Lambda triggers," AWS Documentation. [Online]. Available: https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-challenge.html. [Accessed: Jun. 11, 2026].
[2] Amazon Web Services, "Amazon DynamoDB API Reference," AWS Documentation. [Online]. Available: https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Operations_Amazon_DynamoDB.html. [Accessed: Jun. 11, 2026].
