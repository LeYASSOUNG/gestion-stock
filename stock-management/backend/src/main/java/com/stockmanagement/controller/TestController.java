package com.stockmanagement.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/public-test")
    public String test() {
        return "Public endpoint works! Code changes are being applied.";
    }
}
