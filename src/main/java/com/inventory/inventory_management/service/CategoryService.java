package com.inventory.inventory_management.service;
import java.util.List;

import org.springframework.stereotype.Service;

import com.inventory.inventory_management.entity.Category;
import com.inventory.inventory_management.repository.CategoryRepository;

@Service
public class CategoryService {
	 private final CategoryRepository categoryRepository;

	    public CategoryService(CategoryRepository categoryRepository) {
	        this.categoryRepository = categoryRepository;
	    }

	    public Category createCategory(Category category) {
	        return categoryRepository.save(category);
	    }

	    public List<Category> getAllCategories() {
	        return categoryRepository.findAll();
	    }

	    public Category getCategoryById(Long id) {
	        return categoryRepository.findById(id)
	                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
	    }

	    public Category updateCategory(Long id, Category categoryDetails) {

	        Category category = getCategoryById(id);

	        category.setName(categoryDetails.getName());
	        category.setDescription(categoryDetails.getDescription());

	        return categoryRepository.save(category);
	    }

	    public void deleteCategory(Long id) {
	        Category category = getCategoryById(id);
	        categoryRepository.delete(category);
	    }
}
