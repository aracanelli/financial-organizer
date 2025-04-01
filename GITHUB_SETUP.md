# GitHub Repository Setup

Follow these steps to push your Financial Organizer project to GitHub:

## 1. Create a new repository on GitHub

1. Go to [GitHub](https://github.com/) and log in to your account.
2. Click on the "+" icon in the top-right corner and select "New repository".
3. Enter "financial-organizer" as the repository name.
4. Add a description (optional): "A comprehensive application to manage personal finances, track expenses, and organize receipts."
5. Choose whether you want the repository to be public or private.
6. Do NOT initialize the repository with a README, .gitignore, or license (as we already have these).
7. Click "Create repository".

## 2. Push your local repository to GitHub

After creating the repository, GitHub will show you commands to push an existing repository. Use the following commands in your terminal:

```bash
# Make sure you're in the project's root directory
# C:\Users\racan\OneDrive\Desktop\financial-orginizer

# Add the remote repository URL
git remote add origin https://github.com/aracanelli/financial-organizer.git

# Push the changes to GitHub
git push -u origin master
```

Replace `aracanelli` with your GitHub username if different.

## 3. Verify the push

1. After pushing, refresh your GitHub repository page.
2. All your files should now be visible in the repository.
3. You can now share this repository with others, clone it to other machines, or continue developing your financial organizer application.

## 4. Future commits

For future changes, you can use the standard Git workflow:

```bash
# Add your changes
git add .

# Commit your changes with a meaningful message
git commit -m "Description of the changes"

# Push to GitHub
git push
```

Congratulations! Your Financial Organizer project is now hosted on GitHub. 