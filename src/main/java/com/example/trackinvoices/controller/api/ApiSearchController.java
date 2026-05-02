package com.example.trackinvoices.controller.api;

import com.example.trackinvoices.service.SearchService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiSearchController {

    private final SearchService searchService;

    public ApiSearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/search")
    public List<Map<String, Object>> search(@RequestParam String q) {
        return searchService.globalSearch(q);
    }
}
