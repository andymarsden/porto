<script>
  import { Button } from "$lib/components/ui/button";
</script>

<div class="cool-button-wrap">
  <Button class="cool-button">
    Launch
  </Button>
</div>

<style>
  .cool-button-wrap {
    position: relative;
    display: inline-flex;
    border-radius: 16px;
    padding: 2px;
    background: linear-gradient(
      135deg,
      #ff00aa,
      #ffea00,
      #ff00aa,
      #ffea00
    );
    background-size: 300% 300%;
    animation: borderFlow 4s ease infinite;
  }

  .cool-button-wrap::before {
    content: "";
    position: absolute;
    inset: -6px;
    border-radius: 20px;
    background: inherit;
    filter: blur(14px);
    opacity: 0.55;
    z-index: -1;
  }

  .cool-button {
    border-radius: 14px;
    background: #111;
    color: white;
    border: none;
  }

  .cool-button:hover {
    background: #181818;
  }

  @keyframes borderFlow {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
</style>