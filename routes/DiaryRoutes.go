package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/satyamraj1643/go-diary/controllers"
)

// DiaryRoutes wires Django-style endpoints to Gin handlers.
func DiaryRoutes(r *gin.Engine) {
	entries := r.Group("/entries")
	{
		entries.POST("/create-new", controllers.EntryCreate)
		entries.GET("/details/:id", controllers.EntryDetail)
		entries.GET("/all", controllers.EntryList)
		entries.DELETE("/delete/:id", controllers.EntryDelete)
		entries.POST("/mark-favourite/:id", controllers.EntryMarkFavourite)
		entries.POST("/archive/:id", controllers.EntryArchive)
	}

	collections := r.Group("/collections")
	{
		collections.POST("/create-new", controllers.CollectionCreate)
		collections.GET("/all", controllers.CollectionList)
		collections.DELETE("/delete/:id", controllers.CollectionDelete)
	}

	moods := r.Group("/moods")
	{
		moods.POST("/create-new", controllers.MoodCreate)
		moods.GET("/all", controllers.MoodList)
		moods.DELETE("/delete/:id", controllers.MoodDelete)
	}

	chapters := r.Group("/chapters")
	{
		chapters.POST("/create-new", controllers.ChapterCreate)
		chapters.DELETE("/delete/:id", controllers.ChapterDelete)
		chapters.GET("/all", controllers.ChapterList)
		chapters.POST("/mark-favourite/:id", controllers.ChapterMarkFavourite)
		chapters.POST("/archive/:id", controllers.ChapterArchive)
		chapters.PUT("/update/:id", controllers.ChapterUpdate)
	}
}
