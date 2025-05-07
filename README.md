# Shelf - A Book Recommendation and Management Platform  

![GitHub](https://img.shields.io/badge/Repo-Shelf-8A2BE2)  

## Project Overview  

### Purpose & Objectives  
Shelf is designed as a platform for readers and book recommendations. It helps book enthusiasts discover new titles, organize their reading lists, rate and review books, and engage with a community of like-minded readers. The system addresses challenges such as managing large personal libraries and finding personalized book suggestions while tracking individual reading progress.  

### Problem Solved  
Many readers struggle to keep track of what they want to read, what they are currently reading, and what they have completed. Shelf provides a sustainable, user-friendly solution by offering personalized recommendations, organized shelves (Want to Read, Reading, Read), and goal tracking to motivate readers to achieve their reading targets.  

---

## Features  
- **User Authentication:**  
  - Email/password and social logins (Google/GitHub).  
  - JWT-based secure session management.  

- **Book Management:**  
  - Retrieve detailed book profiles (`getBookProfile`) and personalized recommendations (`getPreferredBooks`).  
  - Dynamic updates to ratings and reviews.  

- **Searching and Filters:**  
  - Browse all books (`getAllBooks`).  
  - Search by genre (`searchBooksByGenre`).  

- **Review and Rating System:**  
  - Submit reviews with star ratings and media uploads (images/videos via Multer + Cloudinary).  
  - Aggregated average ratings and nested comments/replies.  

- **Profile Management:**  
  - Update personal details, reading goals, and preferred genres.  
  - Profile image updates and partial data modifications.  

- **Reading Shelves:**  
  - Organize books into *Want to Read*, *Reading*, and *Read* shelves.  
  - Track reading progress and annual goals.  

- **Report Generation:**  
  - Generate monthly/yearly reports (books read, genre distribution).  
  - Download reports as PDFs using jsPDF.  

---

## Tools and Technology  
- **Backend:** Node.js, Express, REST API  
- **Database:** MongoDB  
- **Authentication:** JWT, Firebase (Google/GitHub OAuth)  
- **File Handling:** Multer (file uploads), Cloudinary (media storage)  
- **Frontend:** React  
- **Libraries:** bcryptjs, cookie-parser, cors, dotenv  

---

## API Design  
### Authentication Endpoints  
- `POST /auth/register`: Register a new user.  
- `POST /auth/login`: Authenticate and issue JWT.  
- `POST /auth/google-login`: Login/register via Google.  

### Book Endpoints  
- `GET /books`: Fetch all books.  
- `POST /books/add`: Add a new book.  
- `GET /books/search-by-genre`: Search by genre.  

### Review Endpoints  
- `POST /reviews/submit`: Submit/update a review with media.  
- `GET /reviews/book/:bookId`: Fetch all reviews for a book.  

### User Endpoints  
- `POST /users/reading-goal`: Set annual reading goal.  
- `PUT /users/updateimg`: Update profile image.  


---

## Conclusion  
Shelf leverages Node.js, MongoDB, and React to deliver a scalable platform for book enthusiasts. Key features include secure authentication, dynamic reviews, reading shelves, and goal tracking. Future enhancements aim to expand community interaction and data insights.  

## gitignore

- .env
- Client/node modules
- server/node modules
- Client/src/firebase

