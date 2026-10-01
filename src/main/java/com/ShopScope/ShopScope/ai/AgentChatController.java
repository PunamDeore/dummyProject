package com.ShopScope.ShopScope.ai;

import com.ShopScope.ShopScope.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/agent")
public class AgentChatController {

    private final AgentChatService agentChatService;

    public AgentChatController(AgentChatService agentChatService) {
        this.agentChatService = agentChatService;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(
            @RequestBody Map<String, String> payload,
            @RequestHeader(value = "X-Time-Zone", defaultValue = "UTC") String timeZone,
            @AuthenticationPrincipal User user) {
        String userMessage = payload.getOrDefault("message", "Hello");
        String conversationId = payload.getOrDefault("conversationId", "default-session");
        Long userId = (user != null && user.getId() != null) ? user.getId() : 1L;

        String assistantResponse = agentChatService.processUserMessage(userMessage, userId, conversationId, timeZone);
        return ResponseEntity.ok(Map.of("response", assistantResponse));
    }
}