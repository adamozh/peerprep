package com.peerprep.peerprepmatchingservice.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.peerprep.peerprepcommon.dto.match.MatchRequest;
import com.peerprep.peerprepmatchingservice.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;

@Component
@RequiredArgsConstructor
public class RedisMessageSubscriber implements MessageListener {

    private final RedisTemplate<String, MatchRequest> redisTemplate;

    private final MatchingService matchingService;

    public void onMessage(Message message, byte[] pattern) {
        try {
            String json = new String(message.getBody());
            MatchRequest matchRequest = (new ObjectMapper()).readValue(json, MatchRequest.class);
            String key = matchRequest.getComplexity().toString() + matchRequest.getComplexity().toString();
            if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
                MatchRequest existing = redisTemplate.opsForValue().getAndDelete(key);
                matchingService.processMatch(matchRequest, existing);
            } else {
                Duration timeout = Duration.ofSeconds(20);
                redisTemplate.opsForValue().set(key, matchRequest, timeout);
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}