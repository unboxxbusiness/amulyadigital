# How a Member Can Log In and Access the Dashboard

This document outlines the step-by-step process for a new member to register and gain access to the member dashboard. The workflow is designed to ensure that only approved members can access protected resources.

## 1. Member Registration

- **Starting Point**: A new user navigates to the `/sign-up` page.
- **Action**: The user creates an account using either an email/password combination or by signing in with their Google account.
- **System Response**:
    - A new user record is created in Firebase Authentication.
    - A corresponding user document is created in the `users` collection in Firestore.
    - This new user is assigned a `status` of **`pending`** by default.
- **Redirection**: After successful registration, the user is automatically redirected to the `/application` page.

## 2. Application Review Status

- **User Experience**: On the `/application` page, the member is shown a status screen indicating that their "Application is Under Review."
- **Access Limitation**: At this point, the member cannot access the main dashboard or any other member-exclusive pages. They must wait for an administrator to approve their application.

## 3. Administrator Approval

- **Starting Point**: An administrator logs into their account.
- **Action**: The administrator navigates to the **Admin Dashboard -> Membership Applications** page (`/admin/applications`).
- **System Response**:
    - The admin sees a list of all users with a `pending` status.
    - The admin finds the new member in the list and clicks the "Approve" action.
    - The system updates the member's user document in Firestore, changing their `status` from `pending` to **`active`**.
    - A unique Member ID is generated and assigned to the member.

## 4. Gaining Dashboard Access

- **Starting Point**: The member, whose application has now been approved, logs in again via the `/sign-in` page.
- **System Response**:
    - The application's authentication and routing logic verifies that the user's status is now `active`.
- **Redirection**: The user is granted access and redirected to the main member dashboard, located at the root URL (`/`).

From this point on, whenever the member logs in, they will be taken directly to their dashboard, where they can view their profile, manage services, and access all member benefits.
