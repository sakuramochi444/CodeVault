import type { NewAlgorithm } from "./schema";

export const starterAlgorithms: NewAlgorithm[] = [
  {
    id: 1,
    title: "二分探索（境界値）",
    category: "探索",
    language: "C++",
    complexity: "O(log N)",
    description: "条件を満たす最小の値を求める lower_bound 型の二分探索。check の単調性を確認して使う。",
    code: `// 条件を満たす最小の x を返す
long long binary_search(long long ng, long long ok) {
    while (abs(ok - ng) > 1) {
        long long mid = (ok + ng) / 2;
        if (check(mid)) ok = mid;
        else ng = mid;
    }
    return ok;
}`,
    tags: ["定番", "境界値"], favorite: true, updatedAt: "今日",
  },
  {
    id: 2,
    title: "Union-Find", category: "データ構造", language: "C++", complexity: "O(α(N))",
    description: "連結成分の併合と判定。経路圧縮と union by size を使用。",
    code: `struct UnionFind {
    vector<int> p, sz;
    UnionFind(int n): p(n), sz(n, 1) { iota(p.begin(), p.end(), 0); }
    int root(int x) { return p[x] == x ? x : p[x] = root(p[x]); }
    bool unite(int a, int b) {
        a = root(a); b = root(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) swap(a, b);
        p[b] = a; sz[a] += sz[b]; return true;
    }
    bool same(int a, int b) { return root(a) == root(b); }
};`,
    tags: ["定番", "グラフ"], favorite: true, updatedAt: "昨日",
  },
  {
    id: 3,
    title: "Dijkstra 法", category: "グラフ", language: "C++", complexity: "O((V+E) log V)",
    description: "非負辺グラフの単一始点最短経路。priority_queue は距離の小さい順。",
    code: `vector<long long> dijkstra(int s, const vector<vector<Edge>>& g) {
    const long long INF = 1LL << 60;
    vector<long long> dist(g.size(), INF);
    priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<pair<long long,int>>> pq;
    dist[s] = 0; pq.push({0, s});
    while (!pq.empty()) {
        auto [d, v] = pq.top(); pq.pop();
        if (d != dist[v]) continue;
        for (auto [to, cost] : g[v]) if (dist[to] > d + cost) {
            dist[to] = d + cost; pq.push({dist[to], to});
        }
    }
    return dist;
}`,
    tags: ["最短経路", "頻出"], favorite: false, updatedAt: "3日前",
  },
  {
    id: 4,
    title: "セグメント木", category: "データ構造", language: "C++", complexity: "O(log N)",
    description: "一点更新・区間取得の汎用セグメント木。演算と単位元を書き換えて利用する。",
    code: `template<class T> struct SegTree {
    int n; T e; vector<T> dat; function<T(T,T)> op;
    SegTree(int size, T e, function<T(T,T)> op): e(e), op(op) {
        n = 1; while (n < size) n <<= 1; dat.assign(2 * n, e);
    }
    void set(int i, T x) {
        for (dat[i += n] = x; i >>= 1; ) dat[i] = op(dat[i << 1], dat[i << 1 | 1]);
    }
    T prod(int l, int r) {
        T vl = e, vr = e;
        for (l += n, r += n; l < r; l >>= 1, r >>= 1) {
            if (l & 1) vl = op(vl, dat[l++]);
            if (r & 1) vr = op(dat[--r], vr);
        }
        return op(vl, vr);
    }
};`,
    tags: ["区間クエリ", "ライブラリ"], favorite: false, updatedAt: "5日前",
  },
  {
    id: 5,
    title: "最大公約数・拡張 Euclid", category: "数学", language: "C++", complexity: "O(log min(a,b))",
    description: "gcd と ax + by = gcd(a,b) を満たす係数を同時に求める。",
    code: `long long extgcd(long long a, long long b, long long &x, long long &y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long d = extgcd(b, a % b, y, x); y -= (a / b) * x; return d;
}`,
    tags: ["整数", "逆元"], favorite: false, updatedAt: "1週間前",
  },
  {
    id: 6,
    title: "Rolling Hash", category: "文字列", language: "C++", complexity: "O(N) / O(1)",
    description: "部分文字列の一致判定。衝突が問題になる場合は二重ハッシュを使う。",
    code: `struct RollingHash {
    static const uint64_t base = 100000007;
    vector<uint64_t> hash, power;
    RollingHash(const string& s): hash(s.size()+1), power(s.size()+1, 1) {
        for (int i = 0; i < (int)s.size(); ++i) {
            hash[i+1] = hash[i] * base + s[i]; power[i+1] = power[i] * base;
        }
    }
    uint64_t get(int l, int r) { return hash[r] - hash[l] * power[r-l]; }
};`,
    tags: ["文字列", "ハッシュ"], favorite: false, updatedAt: "2週間前",
  },
];
